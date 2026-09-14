import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

import { query } from "../config/db.js";

// ─── Constants ───────────────────────────────────────────────────────
const SYSTEM_PROMPT_CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const MAX_MESSAGE_LENGTH = 1000;

// The system prompt ships with every request — recommendations are the one
// section that grows without bound, so cap it and keep the strongest ones.
const MAX_RECOMMENDATIONS_IN_PROMPT = 8;

const MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash-002",
    "gemini-1.5-flash-001",
    "gemini-flash-latest",
];

// ─── Row shapes (match the camelCase columns in sql/schema.sql) ──────
interface ProfileRow {
    userName: string;
    title: string;
    email: string;
    address: string;
    bio: string;
    github: string;
    linkedin: string;
    cvContent: string | null;
}

interface SkillRow {
    name: string;
    yearsOfExperience: number | null;
}

interface ProjectRow {
    title: string;
    description: string;
    demoLink: string | null;
    githubLink: string | null;
}

interface RecommendationRow {
    name: string;
    role: string;
    company: string | null;
    relation: string;
    text: string;
}

class ChatService {
    private cachedSystemPrompt: string | null = null;
    private lastCacheUpdate: number = 0;

    // ─── Public ──────────────────────────────────────────────────────

    async getChatResponse(req: Request, res: Response) {
        try {
            const { message } = req.body;

            if (typeof message !== "string" || !message.trim()) {
                return res.status(400).json({ message: "Message is required" });
            }

            // Guards the GEMINI_API_KEY bill: this endpoint is public, so the
            // input size has to be bounded independently of the body parser.
            if (message.length > MAX_MESSAGE_LENGTH) {
                return res.status(413).json({
                    message: `Message is too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.`,
                });
            }

            const systemPrompt = await this.getSystemPrompt();

            const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

            let lastError: any = null;

            for (const modelName of MODELS) {
                try {
                    const result = await client.models.generateContent({
                        model: modelName,
                        contents: message,
                        config: { systemInstruction: systemPrompt },
                    });

                    return res.status(200).json({ message: result.text });
                } catch (error: any) {
                    console.error(`Error with model ${modelName}:`, error.message);
                    lastError = error;
                    if (error.status === 429) continue; // quota exceeded → try next model
                    break;
                }
            }

            const status = lastError?.status || 500;
            const userFriendlyMessage =
                status === 429
                    ? "AI Quota exceeded for all available models. Please try again later."
                    : status === 404
                        ? "The AI model configuration is invalid or the service is temporarily unavailable."
                        : "Internal Server Error";

            res.status(status).json({ message: userFriendlyMessage, error: lastError?.message });
        } catch (error: any) {
            console.error("ChatService Error:", error);
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    }

    // ─── Private ─────────────────────────────────────────────────────

    /**
     * Returns a cached system prompt, or builds a fresh one from
     * PostgreSQL profile data + CV content when the cache has expired.
     */
    private async getSystemPrompt(): Promise<string> {
        const now = Date.now();

        if (this.cachedSystemPrompt && now - this.lastCacheUpdate < SYSTEM_PROMPT_CACHE_DURATION) {
            return this.cachedSystemPrompt;
        }

        const [profileResult, skillsResult, projectsResult, recommendationsResult] =
            await Promise.all([
                query<ProfileRow>(`SELECT * FROM profiles LIMIT 1`),
                query<SkillRow>(`SELECT "name", "yearsOfExperience" FROM skills`),
                query<ProjectRow>(
                    `SELECT "title", "description", "demoLink", "githubLink" FROM projects`
                ),
                // Featured first, then newest — the same order the site shows them.
                query<RecommendationRow>(
                    `SELECT "name", "role", "company", "relation", "text" FROM recommendations
                     ORDER BY "featured" DESC, "date" DESC
                     LIMIT $1`,
                    [MAX_RECOMMENDATIONS_IN_PROMPT]
                ),
            ]);

        const profile = profileResult.rows[0];
        const skills = skillsResult.rows;
        const projects = projectsResult.rows;
        const recommendations = recommendationsResult.rows;

        if (!profile) {
            throw new Error("Profile data not found to provide context for the AI.");
        }

        const cvContent = profile.cvContent || "CV content not available.";

        this.cachedSystemPrompt = this.buildSystemPrompt(profile, skills, projects, cvContent, recommendations);
        this.lastCacheUpdate = now;

        return this.cachedSystemPrompt;
    }

    /**
     * Assembles the full system prompt string from portfolio data.
     */
    private buildSystemPrompt(
        profile: ProfileRow,
        skills: SkillRow[],
        projects: ProjectRow[],
        cvContent: string = "",
        recommendations: RecommendationRow[] = [],
    ): string {
        const skillsList = skills
            .map((s) => `- ${s.name}${s.yearsOfExperience ? ` (${s.yearsOfExperience} years)` : ""}`)
            .join("\n");

        const projectsList = projects
            .map((p) => `- ${p.title}: ${p.description}`)
            .join("\n");

        // The relation matters as much as the quote: "his manager said" carries
        // weight that "a university friend said" does not, and without it the
        // model would present every quote as if it came from a colleague.
        const recommendationsList = recommendations
            .map((r) => {
                const at = r.company ? ` at ${r.company}` : "";
                return `- ${r.name} (${r.role}${at}) — relationship: ${r.relation}:\n  "${r.text}"`;
            })
            .join("\n");

        return `
You are a highly professional and helpful AI assistant representing Mahmoud Mohamed. Your tone should be polished, knowledgeable, and inviting.

Your mission:
1. Provide detailed and well-structured answers about Mahmoud's background, skills, and projects using ONLY the provided context.
2. **Consult CV Data**: Use the provided CV text below to answer specific questions about Mahmoud's work history, certifications, or detailed experiences not covered in the profile summary.
3. **Prioritize Strong Projects**: When asked about projects, always mention and detail these first: **World Chat App**, **Direct Rent**, **El-Baraka Market**, **Watch Store**, and **Bus Booking**. These represent his advanced full-stack and professional experience.
4. **Recommendations**: When asked what people say about Mahmoud, what he is like to work with, or for references or testimonials, draw on the Recommendations section below. Always name the person and how they know Mahmoud (manager, colleague, freelance client, or university friend) — a manager's assessment and a university friend's differ in weight, and the reader needs to tell them apart. Quote only what is written there; never invent a recommendation, a name, or a job title.
5. Use Markdown for formatting:
   - Use bold titles for clarity.
   - Use ordered (numbered) lists (e.g., 1. , 2. , etc.) when explaining steps or listing multiple items to ensure clarity.
   - Use bullet points (- or *) for listing features, skills, or projects.
   - ALWAYS use lists when providing multiple pieces of information to keep the layout organized.
6. Use emojis in a balanced way (typically 2-4 per response). They should make the response feel inviting but should not be excessive or used in every single sentence.
7. Keep vertical spacing compact: Avoid using triple newlines or excessive empty space between paragraphs and list items.
8. If the user input is nonsensical, gibberish, or completely unclear (e.g., "jbjfj"), politely acknowledge that you don't understand and offer to help them with information about Mahmoud's professional profile.
9. If asked about something not in the context, politely explain you only have information about Mahmoud's professional profile and suggest they contact him directly.

Mahmoud Mohamed's Information:
- Name: ${profile.userName}
- Title: ${profile.title}
- Email: ${profile.email}
- bio: ${profile.bio}
- Links: LinkedIn (${profile.linkedin}), GitHub (${profile.github}), Address (${profile.address})

Skills:
${skillsList}

Projects:
${projectsList}

Recommendations (what people who worked or studied with Mahmoud have said about him):
${recommendationsList || "No recommendations available."}

---
ADDITIONAL CV CONTEXT (Extracted from Mahmoud's Resume):
${cvContent || "No additional CV data available."}
---
`;
    }

}

export const chatService = new ChatService();

