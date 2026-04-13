import { type Request, type Response } from "express";
import { generateJwt, setCookie, clearJwt, generateRefToken, setRefToken } from "../utils/Jwt.js";
import { comparePassword } from "../utils/bcyrpt.js";
import {
  checkUserInDb,
  createUser,
  getUser,
  deleteUserFromDB,
} from "../services/user.js";




export const signUp = async (req: Request, res: Response) => {
  try {
  
    const { username, email, password } = req.body;  
    const isExists = await checkUserInDb(email);

    if (isExists)
      return res.status(400).json({
        success: false,
        message: "User exists, Please login",
      });

    const newUser = await createUser(username, email, password);

    const jwtToken = generateJwt({ userId: String(newUser._id) });
    setCookie(jwtToken, res);

    const refToken = generateRefToken({ userId: String(newUser._id) });
    setRefToken(refToken,res);

    await createRefreshTokenInDb( String(newUser._id) ,refToken );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: {
          _id: newUser._id, 
          username: newUser.username,
          email: newUser.email,
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (err as Error).message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await getUser(email, ["username", "email", "password"]);   

  

    if (!user || (! await comparePassword(password, user.password)))
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });

    const jwtToken = generateJwt({ userId: String(user._id) });
    setCookie(jwtToken, res);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        user: {
          username: user.username,
          email: user.email,
        },
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    clearJwt(res);
    res.json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserPrfile = async (req: Request, res: Response) => {
  try {
    // implement middleware to verify the user
    const userId = String(req.user!.userId);
    const user = await getUser(userId, ["username", "email", "avatar", "dob"]);
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (err as Error).message,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    // implement middleware and token blocking mechanism
    const userId = String(req.user!.userId);
    const deletedUser = await deleteUserFromDB(userId);
    if (!deletedUser)
      res.status(404).json({
        success: false,
        message: "User not found",
      });

    clearJwt(res);
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (err as Error).message,
    });
  }
};
