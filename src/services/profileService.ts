import { Request, Response } from "express";
import { query } from "../config/db.js";
import { buildInsert, buildUpdate, Row } from "../utils/sql.js";
import axios from "axios";
import { extractText, getDocumentProxy } from "unpdf";

const TABLE = "profiles";

const WRITABLE_COLUMNS = [
  "userName",
  "title",
  "email",
  "address",
  "phone1",
  "phone2",
  "bio",
  "avatar",
  "aboutImage",
  "cv",
  "github",
  "linkedin",
  "cvContent",
];

class ProfileService {
    async createProfile(req: Request, res: Response) {
        try {
            if (req.body.cv) {
                try {
                    req.body.cvContent = await this.getCVContent(req.body.cv);
                } catch (error) {
                    console.error("Error parsing CV for new profile:", error);
                }
            }
            const { text, values } = buildInsert(TABLE, req.body as Row, WRITABLE_COLUMNS);
            const result = await query(text, values);
            res.status(201).json(result.rows[0]);
        } catch (error: any) {
            res.status(400).json({ message: error?.message });
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            if (req.body.cv) {
                try {
                    req.body.cvContent = await this.getCVContent(req.body.cv);
                } catch (error) {
                    console.error("Error parsing CV for update:", error);
                }
            }

            // Single-profile upsert: update the row, or insert it if absent.
            const existing = await query<{ id: string }>(
                `SELECT "id" FROM ${TABLE} LIMIT 1`
            );

            if (existing.rows.length > 0) {
                const { text, values } = buildUpdate(
                    TABLE,
                    existing.rows[0].id,
                    req.body as Row,
                    WRITABLE_COLUMNS
                );
                await query(text, values);
            } else {
                const { text, values } = buildInsert(TABLE, req.body as Row, WRITABLE_COLUMNS);
                await query(text, values);
            }

            res.status(200).json({
                message: "You are update profile successfully!",
            });
        } catch (error: any) {
            res.status(400).json({ message: error?.message });
        }
    }

    async getProfile(req: Request, res: Response) {
        try {
            const result = await query(`SELECT * FROM ${TABLE} LIMIT 1`);
            const profile = result.rows[0];
            if (!profile) {
                return res.status(404).json({ message: "Profile not found" });
            }
            res.status(200).json({
                message: "You are get profile successfully!",
                info: profile,
            });
        } catch (error: any) {
            res.status(400).json({ message: error?.message });
        }
    }

    private async getCVContent(url: string): Promise<string> {
        try {
            const response = await axios.get(url, { responseType: "arraybuffer" });
            const data = new Uint8Array(response.data);
            const pdf = await getDocumentProxy(data);
            const { text } = await extractText(pdf, { mergePages: true });
            return text as string;
        } catch (error) {
            throw new Error(`Failed to parse CV: ${error}`);
        }
    }
}

export const profileService = new ProfileService();
