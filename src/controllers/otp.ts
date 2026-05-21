import { type Request, type Response } from "express";
import { checkUserInDb, resetUserPasswordInDB } from "../services/user.js";
import { deleteValueRedis, storeValueRedis, checkValueExistsRedis, getValueRedis } from "../services/redis.js";
import { generateAlphanumericOTP, hashOtp, verifyOtp } from "../utils/crypto.js";
import { sendEmail } from "../services/mail.js";
import { generateResetToken, decodeResetToken } from "../utils/Jwt.js";

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const email = res.locals.validatedBody?.email;  
    const isExists = await checkUserInDb(email);
    if (!isExists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // B. Check if the OTP already exists in Redis without deleting it
    const isExistsInRedis = await checkValueExistsRedis({ prefix: "OTP", key: email });
    if (isExistsInRedis) {
      return res.status(429).json({ success: false, message: "Multiple attempts. Please try again later." });
    }

    const otp = generateAlphanumericOTP();
    const hashedOtp = hashOtp(otp);

    const ttl = 5 * 60; // in seconds
    await storeValueRedis({ prefix: "OTP", key: email, value: hashedOtp, ttl });

    // Send the email using the resend service
    await sendEmail({
      email,
      subject: "Password Reset OTP",
      html: `<p>Your OTP for password reset is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
      text: `Your OTP for password reset is ${otp}. It is valid for 5 minutes.`,
    });

    const expiresAt = new Date(Date.now() + ttl * 1000);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      expiresAt: expiresAt.toISOString()
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (err as Error).message,
    });
  }
};

// 1. Controller to validate the OTP and issue a short-lived recovery token (Method 2)
export const validateOtp = async (req: Request, res: Response) => {
  try {
    const email = res.locals.validatedBody?.email;
    const otp = res.locals.validatedBody?.otp;

    const { value: storedHash } = await getValueRedis({ prefix: "OTP", key: email });
    if (!storedHash) {
      return res.status(400).json({ success: false, message: "OTP expired or not found" });
    }

    // 3. Compare the submitted OTP with the stored hash securely
    const isValid = verifyOtp(otp, storedHash);
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Delete OTP once it's successfully validated to prevent reuse
    await deleteValueRedis({ prefix: "OTP", key: email });

    // Generate a secure, short-lived reset token (valid for 10 minutes)
    const resetToken = generateResetToken(email);

    // 4. Respond OK with the resetToken
    res.status(200).json({
      success: true,
      message: "OTP validated successfully",
      resetToken
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (err as Error).message,
    });
  }
};

// Controller to reset the password using the reset token (Method 2)
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { password } = res.locals.validatedBody || req.body;
    
    // Extract resetToken from Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    const resetToken = authHeader && authHeader.startsWith("Bearer ") 
      ? authHeader.split(" ")[1] 
      : req.body.resetToken;

    if (!resetToken) {
      return res.status(401).json({ success: false, message: "Reset token is missing or unauthorized" });
    }

    // Verify and decode the reset token
    const decoded = decodeResetToken(resetToken);
    if (!decoded || !decoded.email) {
      return res.status(401).json({ success: false, message: "Invalid or expired reset token" });
    }

    // Update password in DB
    const isUpdated = await resetUserPasswordInDB(decoded.email, password);
    if (!isUpdated) {
      return res.status(500).json({ success: false, message: "Failed to reset password. Please try again." });
    }

    res.status(200).json({
      success: true,
      message: "Password reset successfully. Please log in with your new password."
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (err as Error).message,
    });
  }
};
