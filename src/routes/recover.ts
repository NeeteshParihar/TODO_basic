import { Router } from "express";
import { sendOtp, validateOtp } from "../controllers/otp.js";
import { otpEmailSchema, otpValidateSchema } from "../dataValidation/user.js";
import { validateData } from "../middleware/dataValidation.js";

const router = Router();

router.post("/passwordReset", validateData(otpEmailSchema), sendOtp);
router.post("/validateOtp", validateData(otpValidateSchema), validateOtp);
export default router;

