import { Router } from "express";
import { getUsers, updateUserState, createAppeal, getAppeals, updateAppeal } from "../controller/userController";

const router = Router();

router.get("/getUsers", getUsers);
router.patch("/updateUserState/:id", updateUserState);
router.post("/createAppeal", createAppeal);
router.get("/getAppeals", getAppeals);
router.patch("/updateAppeal/:id", updateAppeal);
export default router;
