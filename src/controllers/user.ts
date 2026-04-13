import { type Request, type Response } from "express";
import { Types } from "mongoose";

import {
  generateJwt,
  setCookie,
  clearJwt,
  generateRefToken,
  setRefToken,
  clearRefToken,
} from "../utils/Jwt.js";
import { comparePassword } from "../utils/bcyrpt.js";
import {
  checkUserInDb,
  createUser,
  getUser,
  deleteUserFromDB,
} from "../services/user.js";

import {
  createRefreshToken,
  deleteRefreshToken,
  revokeAllRefreshTokens,
  getRefreshToken,
} from "../services/token.js";

import { decode } from "../utils/Jwt.js";

export const signUp = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const isExists = await checkUserInDb(email);

    if (isExists)
      return res.status(400).json({
        success: false,
        message: "User exists, Please login",
      });

    const userId = String(new Types.ObjectId());
    const jwtToken = generateJwt({ userId: userId });
    const refToken = generateRefToken({ userId: userId });

    await createRefreshToken({ userId: userId, refreshToken: refToken });

    const newUser = await createUser({
      _id: userId,
      username,
      email,
      password,
    });

    setCookie(jwtToken, res);
    setRefToken(refToken, res);

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

    if (!user || !(await comparePassword(password, user.password)))
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });

    const _id: string = String(user._id);

    const jwtToken = generateJwt({ userId: _id });
    const refToken = generateRefToken({ userId: _id });

    await createRefreshToken({ userId: _id, refreshToken: refToken });

    setCookie(jwtToken, res);
    setRefToken(refToken, res);

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
  } catch (err: any) {
    console.log(err);

    if (err.code == "11000") {
      res.status(400).json({
        success: false,
        message: "BAD REQUEST!",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // block the accesToken
    // revoke/ delete the refreshToken

    const { refToken } = req.cookies;

    await deleteRefreshToken(refToken);

    clearJwt(res);
    clearRefToken(res);

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

export const refreshTheToken = async (req: Request, res: Response) => {
  try {

    const { refToken } = req.cookies;
    const payload = decode(refToken);

    if (!refToken)
      return res
        .status(400)
        .json({ success: false, message: "Please login Again!" });

    if (!payload) {
      await deleteRefreshToken(refToken);
      return res
        .status(400)
        .json({ success: false, message: "Please login Again!" });
    }

    // if refresh Token is valid --> maybe the used is got deleted so we have to check in db

    const token = await getRefreshToken(refToken);  

    if (!token || token.expiresAt < new Date()) {

      if (token) await deleteRefreshToken(refToken);

      return res
        .status(400)
        .json({ success: false, message: "Please login Again!" });
    }

    // if the user have the token and also a valid token then give the access tokens

    const jwtToken = generateJwt({ userId: payload.userId });
    setCookie( jwtToken,  res );
    res.status(200).json({  success: true, message: "Refreshed successfully!"});

  } catch (err) {}
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

    await revokeAllRefreshTokens(userId);
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
