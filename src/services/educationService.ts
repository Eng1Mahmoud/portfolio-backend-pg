import { Request, Response } from "express";
import { query } from "../config/db.js";
import { buildInsert, buildUpdate, Row } from "../utils/sql.js";

const TABLE = "education";

const WRITABLE_COLUMNS = [
  "degree",
  "institution",
  "startDate",
  "endDate",
  "description",
  "skills",
  "image",
];

const PUBLIC_COLUMNS = `"id", "degree", "institution", "startDate", "endDate",
                        "description", "skills", "image"`;

class EducationService {
    async createEducation(req: Request, res: Response) {
        try {
            const { text, values } = buildInsert(TABLE, req.body as Row, WRITABLE_COLUMNS);
            await query(text, values);
            res.status(201).json({ message: "Education created successfully" });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateEducation(req: Request, res: Response) {
        try {
            const { text, values } = buildUpdate(TABLE, req.params.id as string, req.body as Row, WRITABLE_COLUMNS);
            await query(text, values);
            res.status(200).json({ message: "Education updated successfully" });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteEducation(req: Request, res: Response) {
        try {
            await query(`DELETE FROM ${TABLE} WHERE "id" = $1`, [req.params.id]);
            res.status(200).json({ message: "Education deleted successfully" });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getEducationById(req: Request, res: Response) {
        try {
            const result = await query(
                `SELECT ${PUBLIC_COLUMNS} FROM ${TABLE} WHERE "id" = $1`,
                [req.params.id]
            );
            res.status(200).json({
                education: result.rows[0] ?? null,
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAllEducations(req: Request, res: Response) {
        try {
            const result = await query(
                `SELECT ${PUBLIC_COLUMNS} FROM ${TABLE} ORDER BY "createdAt" DESC`
            );

            res.status(200).json({
                message: "Educations retrieved successfully",
                educations: result.rows,
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

export const educationService = new EducationService();
