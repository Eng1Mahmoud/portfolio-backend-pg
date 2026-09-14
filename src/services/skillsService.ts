import { Request, Response } from "express";
import { query } from "../config/db.js";
import { buildInsert, buildUpdate, Row } from "../utils/sql.js";

const TABLE = "skills";

// Unknown body keys are ignored; timestamps are excluded from responses.
const WRITABLE_COLUMNS = ["name", "imageUrl", "category", "yearsOfExperience"];

const PUBLIC_COLUMNS = `"id", "name", "imageUrl", "category", "yearsOfExperience"`;

class SkillsService {
    async createSkill(req: Request, res: Response) {
        try {
            const { text, values } = buildInsert(TABLE, req.body as Row, WRITABLE_COLUMNS);
            await query(text, values);
            res.status(201).json({
                message: "Skill created successfully",
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateSkill(req: Request, res: Response) {
        try {
            const { text, values } = buildUpdate(TABLE, req.params.id as string, req.body as Row, WRITABLE_COLUMNS, {
                touchUpdatedAt: true,
            });
            await query(text, values);
            res.status(200).json({
                message: "Skill updated successfully",
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteSkill(req: Request, res: Response) {
        try {
            await query(`DELETE FROM ${TABLE} WHERE "id" = $1`, [req.params.id]);
            res.status(200).json({
                message: "Skill deleted successfully",
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAllSkills(req: Request, res: Response) {
        try {
            const result = await query(`SELECT ${PUBLIC_COLUMNS} FROM ${TABLE}`);
            res.status(200).json({
                skills: result.rows,
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getSkillById(req: Request, res: Response) {
        try {
            const result = await query(
                `SELECT ${PUBLIC_COLUMNS} FROM ${TABLE} WHERE "id" = $1`,
                [req.params.id]
            );
            res.status(200).json({
                skill: result.rows[0] ?? null,
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

export const skillsService = new SkillsService();
