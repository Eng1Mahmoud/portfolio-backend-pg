import cors from "cors";
import rateLimit from "express-rate-limit";

/**
 * Origins allowed to call this API from a browser.
 *
 * Note the frontend calls this API from Next.js server actions and server
 * components, which send no Origin header at all — those requests are
 * server-to-server and are allowed through below. CORS therefore protects
 * against other sites' browser JavaScript calling the API, not against the
 * portfolio's own traffic.
 */
const DEFAULT_ORIGINS = [
  "https://dev-mahmoud-portfolio.vercel.app",
  "http://localhost:3000",
];

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const origins = allowedOrigins.length ? allowedOrigins : DEFAULT_ORIGINS;

export const corsMiddleware = cors({
  origin(origin, callback) {
    // No Origin header: curl, server-to-server, same-origin. Not a browser
    // cross-origin request, so there is nothing for CORS to protect against.
    if (!origin) return callback(null, true);

    // Disallowed: reply without CORS headers so the browser blocks it.
    // Returning an Error here would surface as a 500 for every bot that probes.
    return callback(null, origins.includes(origin));
  },
  credentials: true,
});

/**
 * The chat endpoint is deliberately unauthenticated so visitors can use it,
 * which makes it the one route where an abuser can spend money on the
 * GEMINI_API_KEY. Keep this tight.
 */
export const chatLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message: "Too many messages. Please wait a few minutes and try again.",
  },
});

/** Slows down credential stuffing against /api/auth/login. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: "Too many login attempts. Please try again later." },
});
