import express from "express";
import cors from "cors";
import patientRoutes from './routes/patient.js';
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/patients', patientRoutes);

app.get("/health", (_req, res) => {
	res.status(200).json({ ok: true });
});

export default app;
