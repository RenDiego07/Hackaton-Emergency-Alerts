import type { Request, Response } from 'express';
import { registerPatientSchema } from '../schemas/patient.js'; // Remember the .js!
import { PatientService } from '../services/patient_service.js';

const { createPatient } = PatientService;

export const registerPatient = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Validate the incoming data (datos)
        const validatedData = registerPatientSchema.parse(req.body);

        console.log(`📝 Registration request received for: ${validatedData.email}`);

        // 2. Call the service (servicio) to handle the database logic
        const result = await  createPatient(validatedData);

        // 3. Return a successful response (respuesta)
        res.status(201).json({
            status: "success",
            message: "Patient registered successfully",
            data: result.patient
        });

    } catch (error: any) {
        // Handle validation errors (errores de validación) from Zod
        if (error.name === 'ZodError') {
            res.status(400).json({
                status: "error",
                message: "Validation failed",
                issues: error.errors
            });
            return;
        }

        // Handle database or service errors
        console.error("Controller Error in registerPatient:", error.message);
        res.status(500).json({ 
            status: "error", 
            message: error.message || "Internal server error" 
        });
    }
};