import { NextFunction, Request, Response } from "express";
export const iosPurchases = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(200).json({ test: "test" });
};
