import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import expenseRoutes from "./routes/expenses.routes";
import categoryRoutes from "./routes/categories.routes";
import analyticsRoutes from "./routes/analytics.routes";
import userRoutes from "./routes/user.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" }));
app.use(express.json());

// Health Check Endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ledger-backend", timestamp: new Date().toISOString() });
});

// Mounted Backend API Routes
app.use("/api/v1/expenses", expenseRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/user", userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Ledger Backend Server running on http://localhost:${PORT}`);
});
