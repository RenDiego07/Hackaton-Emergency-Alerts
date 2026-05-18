
import { Router, type Router as ExpressRouter } from "express";
import { emergencyAdmissionWebhook } from "../controllers/webhook.js";

const router: ExpressRouter = Router();

router.post("/emergency-admission", emergencyAdmissionWebhook);

export default router;
