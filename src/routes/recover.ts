import { Router } from "express";
import { sendOtp, validateOtp, resetPassword } from "../controllers/otp.js";
import { otpEmailSchema, otpValidateSchema, resetPasswordSchema } from "../dataValidation/user.js";
import { validateData } from "../middleware/dataValidation.js";

const router = Router();

router.post("/passwordReset", validateData(otpEmailSchema), sendOtp);
router.post("/validateOtp", validateData(otpValidateSchema), validateOtp);
router.post("/resetPassword", validateData(resetPasswordSchema), resetPassword);
export default router;



