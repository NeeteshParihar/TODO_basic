import z from "zod"

const Email =  z.string().email().trim().toLowerCase();
const Password = z.string().trim().min(8);

// data validations and sanitization , remember if we pass the extra fields then those extra fields are only checked at shcema level
export const userSignupSchema = z.object({
    username: z.string().trim().min(2),
    email: Email,
    password: Password
})

export const userloginSchema = z.object({
    email:Email,
    password: Password
})

// ctx: this is the context an object in which we can add the issues or errors
// z.NEVER: this is a constant that tells zod --> stop validating this data its completed broken or invalid this helps us to stop checking just after return
// code:  z.ZodIssueCode.custom --> it tells zod that we are returning a cursom error so it won't check it against its built in types 
export const IUserUpdate = z.object({
    username: z.string().trim().min(2).optional(),
    dob: z.string().superRefine((val, ctx) => {
        const date = new Date(val);
        if (isNaN(date.getTime())) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid date format",
            });
            return z.NEVER;
        }
        if (date > new Date()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Date of birth cannot be in the future",
            });
        }
    }).optional()
}).refine(data => data.username !== undefined || data.dob !== undefined, {
    message: "Provide at least one field to update"
});

export const otpEmailSchema = z.object({
    email: Email,
});

export const otpValidateSchema = z.object({
    email: Email,
    otp: z.string().trim().min(1),
});

export const resetPasswordSchema = z.object({
    password: Password,
    resetToken: z.string().trim().min(1),
});
