import crypto from "crypto";

export const  generateAlphanumericOTP = (length = 6) => {

  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, characters.length);
    otp += characters[randomIndex];
  }  
  return otp;
}

export const hashOtp = (otp: string) => {
  const secret = process.env.OTP_SECRET;
  if (!secret) {
    throw new Error("OTP_SECRET is not defined in environment variables");
  }
  return crypto.createHmac("sha256", secret).update(otp).digest("hex");
};

export const verifyOtp = (submittedOTP: string, storedHash: string) => {
  const submittedHash = hashOtp(submittedOTP);
  return crypto.timingSafeEqual(
    Buffer.from(submittedHash),
    Buffer.from(storedHash)
  );
};


