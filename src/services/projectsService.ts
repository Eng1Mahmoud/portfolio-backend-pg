import { Request, Response } from "express";
import { query } from "../config/db.js";
import { buildInsert, buildUpdate, Row } from "../utils/sql.js";

const TABLE = "projects";

const WRITABLE_COLUMNS = [
  "title",
  "description",
  "imageUrl",
  "demoLink",
  "githubLink",
  "technologies",
  "order",
];

const PUBLIC_COLUMNS = `"id", "title", "description", "imageUrl", "demoLink",
                        "githubLink", "technologies", "order"`;

class ProjectsService {
    async createProject(req: Request, res: Response) {
        try {
            const { text, values } = buildInsert(TABLE, req.body as Row, WRITABLE_COLUMNS);
            await query(text, values);
            res.status(201).json({ message: "Project created successfully" });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateProject(req: Request, res: Response) {
        try {
            const { text, values } = buildUpdate(TABLE, req.params.id as string, req.body as Row, WRITABLE_COLUMNS);
            await query(text, values);
            res.status(200).json({ message: "Project updated successfully" });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteProject(req: Request, res: Response) {
        try {
            await query(`DELETE FROM ${TABLE} WHERE "id" = $1`, [req.params.id]);
            res.status(200).json({ message: "Project deleted successfully" });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getProjectById(req: Request, res: Response) {
        try {
            const result = await query(
                `SELECT ${PUBLIC_COLUMNS} FROM ${TABLE} WHERE "id" = $1`,
                [req.params.id]
            );
            res.status(200).json({
                project: result.rows[0] ?? null,
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAllProjects(req: Request, res: Response) {
        try {
            const result = await query(
                `SELECT ${PUBLIC_COLUMNS} FROM ${TABLE}
                 ORDER BY "order" ASC, "createdAt" DESC`
            );

            res.status(200).json({
                message: "Projects retrieved successfully",
                projects: result.rows,
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

export const projectsService = new ProjectsService();
