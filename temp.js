import crypto from "crypto";

const refreshToken = "neetesh Parihar";
const secretKey = "my-key";
const val = crypto.createHmac("sha256", secretKey).update(refreshToken).digest("hex");

console.log(val);


