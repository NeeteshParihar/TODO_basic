import z from "zod"

const Email =  z.string().email().trim().toLowerCase();
const Password = z.string().trim().min(8);

// data validations and sanitization , remember if we pass the extra fields then those extra fields are only checked at shcema level
export const userSignupSchema = z.object({
    username: z.string().trim().min(3),
    email: Email,
    password: Password
})

export const userloginSchema = z.object({
    email:Email,
    password: Password
})

