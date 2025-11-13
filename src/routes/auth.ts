import { Router } from "express";
import { login, register, me, logout } from "../controller/authController";
import { authenticateJWT } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticateJWT, me);

export default router;
