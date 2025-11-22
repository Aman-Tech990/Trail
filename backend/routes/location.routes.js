import express from 'express';
import { checkLocationEligibility } from '../controllers/location.controllers.js';

const router = express.Router();

// POST /api/location/check-eligibility - Check if user is eligible for scheme based on location
router.post('/checkLocation', checkLocationEligibility);

export default router;