import express, { type Express } from "express";
import cors from "cors";
import patientRoutes from "./routes/patient.js";
import webhookRoutes from "./routes/webhook.js";

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/api/patients", patientRoutes);
app.use("/webhook", webhookRoutes);

app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
});

export default app;
