import { Request, Response } from "express";
import { query } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface UserRow {
  id: string;
  email: string;
  password: string;
  role: string;
}

class AuthService {
    async register(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const existing = await query<{ id: string }>(
                `SELECT "id" FROM users WHERE "email" = $1`,
                [email]
            );
            if (existing.rows.length > 0) {
                return res.status(400).json({ message: "User already exists" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await query(
                `INSERT INTO users ("email", "password") VALUES ($1, $2)`,
                [email, hashedPassword]
            );

            res.status(201).json({
                message: "User created successfully",
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const result = await query<UserRow>(
                `SELECT "id", "email", "password", "role" FROM users WHERE "email" = $1`,
                [email]
            );
            const user = result.rows[0];

            if (user && (await bcrypt.compare(password, user.password))) {
                res.status(200).json({
                    message: "You are login successfully!",
                    token: this.generateToken(user.id, user.role),
                });
            } else {
                res.status(401).json({ message: "Invalid credentials" });
            }
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    private generateToken(id: string, role: string) {
        return jwt.sign({ id, role }, process.env.JWT_SECRET!, {
            expiresIn: "30d",
        });
    }
}

export const authService = new AuthService();
