import { Router } from "express";
import { login, register, me } from "../controller/authController";
import { authenticateJWT } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected route - requires valid JWT
router.get("/me", authenticateJWT, me);

export default router;
