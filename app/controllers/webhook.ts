
import type { Request, Response } from "express";
import { notificationSyncAgent } from "../services/notificationAgent.js";

export const emergencyAdmissionWebhook = async (
    req: Request,
    res: Response
): Promise<void> => {
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
            hospitalAction: "Continuar admisión y esperar validación administrativa.",
            caseManagerAction: "Revisar preexistencia y confirmar cobertura.",
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
};
