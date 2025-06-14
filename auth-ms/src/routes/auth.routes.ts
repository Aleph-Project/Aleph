import { Router } from "express";
import { register, registerdsk, login, activate, forgotPassword, verifyCode, changePassword, activateDsk } from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/register-dsk", registerdsk);
router.post("/activate-dsk", activateDsk);
router.post("/login", login);
router.post("/activate", activate);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyCode);
router.post("/reset-password", changePassword);

export default router;
