import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import authRoutes from "./src/routes/auth.route";
import { authenticateJWT } from "middlewares/auth.middleware";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use("/api/auth", authRoutes);

app.use(authenticateJWT)

export default app;
