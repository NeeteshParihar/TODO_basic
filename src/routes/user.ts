import { Router } from "express";
import {
  signUp,
  login,
  logout,
  getUserPrfile,
  deleteUser,
} from "../controllers/user.js";

import { userSignupSchema,  userloginSchema } from "../dataValidation/user.js";
import { validateData } from "../middleware/dataValidation.js";
import { validateJwt } from "../middleware/users.js";

const router = Router();

router.post("/signup", validateData(userSignupSchema),  signUp);
router.post("/login", validateData(userloginSchema), login);
router.post("/logout", logout);
router.get("/profile", validateJwt, getUserPrfile);
router.delete("/", validateJwt, deleteUser);

export default router;