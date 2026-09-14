import { Request, Response } from "express";
import { query } from "../config/db.js";
import { buildInsert, buildUpdate, Row } from "../utils/sql.js";

const TABLE = "experience";

const WRITABLE_COLUMNS = [
  "role",
  "company",
  "startDate",
  "endDate",
  "workType",
  "skills",
  "image",
  "description",
];

const PUBLIC_COLUMNS = `"id", "role", "company", "startDate", "endDate", "workType",
                        "skills", "image", "description"`;

class ExperienceService {
    async createExperience(req: Request, res: Response) {
        try {
            const { text, values } = buildInsert(TABLE, req.body as Row, WRITABLE_COLUMNS);
            await query(text, values);
            res.status(201).json({ message: "Experience created successfully" });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateExperience(req: Request, res: Response) {
        try {
            const { text, values } = buildUpdate(TABLE, req.params.id as string, req.body as Row, WRITABLE_COLUMNS);
            await query(text, values);
            res.status(200).json({ message: "Experience updated successfully" });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteExperience(req: Request, res: Response) {
        try {
            await query(`DELETE FROM ${TABLE} WHERE "id" = $1`, [req.params.id]);
            res.status(200).json({ message: "Experience deleted successfully" });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getExperienceById(req: Request, res: Response) {
        try {
            const result = await query(
                `SELECT ${PUBLIC_COLUMNS} FROM ${TABLE} WHERE "id" = $1`,
                [req.params.id]
            );
            res.status(200).json({
                experience: result.rows[0] ?? null,
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAllExperiences(req: Request, res: Response) {
        try {
            const result = await query(
                `SELECT ${PUBLIC_COLUMNS} FROM ${TABLE} ORDER BY "createdAt" DESC`
            );

            res.status(200).json({
                message: "Experiences retrieved successfully",
                experiences: result.rows,
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

export const experienceService = new ExperienceService();
