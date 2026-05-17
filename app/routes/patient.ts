import { Router } from 'express';
// Make sure to update the import name if you renamed your controller file!
import { registerPatient } from '../controllers/patient.js'; 

const router = Router();

// POST /api/patients/register
router.post('/register', registerPatient);

export default router;