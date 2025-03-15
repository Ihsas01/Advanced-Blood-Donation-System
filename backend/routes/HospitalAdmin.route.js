import express from 'express';
import upload from '../utils/Multer.js';
import {
    getHospitalAdmins,
    getHospitalAdminById,
    createHospitalAdmin,
    updateHospitalAdmin,
    deleteHospitalAdmin,
    activateDeactivateHospitalAdmin
} from '../controllers/HospitalAdmin.controller.js';

const router = express.Router();

// Hospital Admin CRUD Routes
router.get('/', getHospitalAdmins);               // Get all hospital admins
router.get('/:id', getHospitalAdminById);         // Get a single hospital admin by ID
router.post('/', upload.single('image'), createHospitalAdmin); // Create a new hospital admin with optional image upload
router.put('/:id', upload.single('image'), updateHospitalAdmin); // Update hospital admin details with optional image upload
router.patch('/:id/toggle-status', activateDeactivateHospitalAdmin);
router.delete('/:id', deleteHospitalAdmin);       // Delete a hospital admin

export default router;