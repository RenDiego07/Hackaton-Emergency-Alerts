import { z } from 'zod';

export const registerPatientSchema = z.object({
    email: z.string().email("Debe ser un correo electrónico válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(), // Optional since we're setting a default password in the service
    full_name: z.string().min(2, "El nombre es requerido"),
    document_type: z.string().min(1, "El tipo de documento es requerido"),
    document_number: z.string().min(1, "El número de documento es requerido"),
    phone: z.string().min(10, "El número de teléfono debe tener al menos 10 caracteres"),
    birth_date: z.string(), // Format YYYY-MM-DD expected
    gender: z.string(),
    emergency_contact_name: z.string(),
    emergency_contact_phone: z.string(),
});

export type RegisterPatientInput = z.infer<typeof registerPatientSchema>;