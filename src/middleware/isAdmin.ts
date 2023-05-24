import { Request, Response, NextFunction } from "express";
import { CustomRequest } from "../types/customRequest";


export const isAdmin = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized access!" });
    }
    if (!req.user.isAdmin) {
        return res.status(401).json({ success: false, message: "Unauthorized access!" });
    }
    next();
};