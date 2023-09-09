import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UsersModel } from "../models/users";
import { CustomRequest } from "../types/customRequest";

export const isAuth = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    console.log(token);
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET as string);
      const user = await UsersModel.findById((decode as any).userId);
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized access!" });
      }

      req.user = {
        email: user.email,
        id: user._id,
        isVerified: user.isVerified,
        languages: user.languages,
        isAdmin: user.isAdmin,
      };
      next();
    } catch (error) {
      if ((error as any).name === "JsonWebTokenError") {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized access!" });
      }
      if ((error as any) === "TokenExpiredError") {
        return res.json({
          success: false,
          message: "session expired try sign in!",
        });
      }

      res
        .status(500)
        .json({ success: false, message: "Internal server error!" });
    }
  } else {
    res.status(401).json({ success: false, message: "Unauthorized access!" });
  }
};
