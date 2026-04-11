import type { Request, Response, NextFunction } from "express";
import { success, z, ZodError } from "zod";

type DataType = "body" | "query" | "param";

export const validateData = (schema: z.ZodObject<any, any>, type: DataType = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (type === "body") {
        req.body = schema.parse(req.body);
      }else if( type === "query"){
         schema.parse(req.query)        
      }else{
        schema.parse(req.params)
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ");
        return res.status(400).json({
          success: false,
          message: message,
        });
      }

      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};


