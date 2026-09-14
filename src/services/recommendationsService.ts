import { Request, Response } from "express";
import { query } from "../config/db.js";
import { buildInsert, buildUpdate, Row } from "../utils/sql.js";

const TABLE = "recommendations";

const WRITABLE_COLUMNS = [
  "name",
  "role",
  "company",
  "avatar",
  "text",
  "relation",
  "date",
  "linkedinUrl",
  "featured",
  "order",
];

const PUBLIC_COLUMNS = `"id", "name", "role", "company", "avatar", "text", "relation",
                        "date", "linkedinUrl", "featured", "order"`;

class RecommendationsService {
  async createRecommendation(req: Request, res: Response) {
    try {
      // An invalid `relation` is rejected by the schema's CHECK constraint.
      const { text, values } = buildInsert(TABLE, req.body as Row, WRITABLE_COLUMNS);
      await query(text, values);
      res.status(201).json({
        message: "Recommendation created successfully",
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateRecommendation(req: Request, res: Response) {
    try {
      const { text, values } = buildUpdate(TABLE, req.params.id as string, req.body as Row, WRITABLE_COLUMNS, {
        touchUpdatedAt: true,
      });
      await query(text, values);
      res.status(200).json({
        message: "Recommendation updated successfully",
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteRecommendation(req: Request, res: Response) {
    try {
      await query(`DELETE FROM ${TABLE} WHERE "id" = $1`, [req.params.id]);
      res.status(200).json({
        message: "Recommendation deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getRecommendationById(req: Request, res: Response) {
    try {
      const result = await query(
        `SELECT ${PUBLIC_COLUMNS} FROM ${TABLE} WHERE "id" = $1`,
        [req.params.id]
      );
      res.status(200).json({
        recommendation: result.rows[0] ?? null,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAllRecommendations(req: Request, res: Response) {
    try {
      const result = await query(
        `SELECT ${PUBLIC_COLUMNS} FROM ${TABLE}
         ORDER BY "order" ASC, "featured" DESC, "date" DESC`
      );

      res.status(200).json({
        message: "Recommendations retrieved successfully",
        recommendations: result.rows,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const recommendationsService = new RecommendationsService();
