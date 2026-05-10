import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

type DataType = "body" | "query" | "param";

export const validateData = (schema: z.ZodObject<any, any>, type: DataType = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (type === "body") {
        console.log("inside the validator");
        console.log(req.body);
        res.locals.validatedBody = schema.parse(req.body);
      } else if (type === "query") {

        res.locals.validatedQuery = schema.parse(req.query);

      } else {
        res.locals.validatedParams = schema.parse(req.params);
      }

      next();
    } catch (err) {

      // if its zod error
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
