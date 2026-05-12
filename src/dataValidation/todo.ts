
import z from "zod";

export const TodoSchema = z.object({
    title: z.string().trim().min(3),
    date: z.coerce.date(),
    isCompleted: z.boolean().optional(),
})


export const TodoUpdateSchema = z.object({
    title: z.string().trim().min(3).optional(),
    isCompleted: z.boolean().optional(),
    date: z.coerce.date().optional()
}).refine((data) => {
    if (!data.title && data.isCompleted != false && !data.isCompleted && !data.date) return false;
    return true;
}, {
    message: "Invalid update request!",
})

export const TodoGetSchema = z.object({
    limit: z.coerce.number().min(1).optional(),
    cursor: z.coerce.date().optional()
})


export const TodoGetByDateRangeSchema = z.object({
    limit: z.coerce.number().min(1).max(20).optional(),
    cursor: z.coerce.date().optional(),
    isCompleted: z.enum(["true", "false"]).transform((val) => val === "true").optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional()
}).refine((data) => {   
    if (data.cursor && data.startDate && data.cursor < data.startDate) return false;
    if (data.startDate && data.endDate && data.startDate > data.endDate) return false;
    return true;
}, {
    message: "Invalid get request!", 
    
})

/* 
 title: string;
    date: Date;
    isCompleted: boolean;
    user: Schema.Types.ObjectId | string

     title, date, isCompleted

*/


export const TodoGetGraphSchema = z.object({
    targetDate: z.coerce.date()
})



