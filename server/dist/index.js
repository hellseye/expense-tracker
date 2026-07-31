"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const expenses_routes_1 = __importDefault(require("./routes/expenses.routes"));
const categories_routes_1 = __importDefault(require("./routes/categories.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" }));
app.use(express_1.default.json());
// Health Check Endpoint
app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "ledger-backend", timestamp: new Date().toISOString() });
});
// Mounted Backend API Routes
app.use("/api/v1/expenses", expenses_routes_1.default);
app.use("/api/v1/categories", categories_routes_1.default);
app.use("/api/v1/analytics", analytics_routes_1.default);
app.use("/api/v1/user", user_routes_1.default);
app.listen(PORT, () => {
    console.log(`🚀 Ledger Backend Server running on http://localhost:${PORT}`);
});
