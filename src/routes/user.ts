import { Router } from "express";
import {
  signUp,
  login,
  logout,
  getUserPrfile,
  deleteUser,
  refreshTheToken,
} from "../controllers/user.js";

import { userSignupSchema,  userloginSchema } from "../dataValidation/user.js";
import { validateData } from "../middleware/dataValidation.js";
import { validateJwt } from "../middleware/users.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.use(rateLimiter("auth"));
router.post("/auth/signup", validateData(userSignupSchema),  signUp);
router.post("/auth/login", validateData(userloginSchema), login);
router.post("/auth/logout",validateJwt, logout);
router.post("/auth/refreshToken", refreshTheToken);
router.get("/profile", validateJwt, getUserPrfile);
router.delete("/", validateJwt, deleteUser);


export default router;