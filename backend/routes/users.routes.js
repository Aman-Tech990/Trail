// routes/userRoutes.js
import express from 'express';
import { createUser } from '../controllers/users.controllers.js';

const router = express.Router();

// POST /api/users
router.post('/', createUser);

export default router;
