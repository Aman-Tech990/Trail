import express from 'express';
import { createUser } from '../controllers/users.controllers.js'; // Correct path

const router = express.Router();

// POST /api/users
router.post('/', createUser);

export default router;