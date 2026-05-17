
import express, { type Express } from "express";
import cors from "cors";
import { notificationSyncAgent } from "./services/notificationAgent.js";

const app: Express = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
});

app.post("/webhook/emergency-admission", async (req, res) => {
    try {
        const event = req.body;

        const caseData = {
            caseId: `CASE-${Date.now()}`,
            patientId: event.patientId ?? "0912345678",
            patientName: event.patientName ?? "Juan Pérez",
            hospitalName: event.hospitalName ?? "Hospital Central",
            emergencyType: event.emergencyType ?? "Dolor torácico",
            policyStatus: "ACTIVE",
            plan: "Premium",
            emergencyCoverage: true,
            preExistingConditions: ["Hipertensión"],
            decision: "REQUIRES_REVIEW",
            reason:
                "La póliza está activa, pero existe una preexistencia que requiere revisión administrativa.",
            hospitalAction:
                "Continuar admisión y esperar validación administrativa.",
            caseManagerAction:
                "Revisar preexistencia y confirmar cobertura.",
        };

        const notificationStatus = await notificationSyncAgent(caseData);

        res.status(200).json({
            success: true,
            message: "Emergency admission processed",
            caseId: caseData.caseId,
            decision: caseData.decision,
            notificationStatus,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : error,
        });
    }
});

export default app;
