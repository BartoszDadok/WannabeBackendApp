import { Request } from "express";
import { User } from "./user";
export type CustomRequest = Request & { user?: User }