import { Types } from "mongoose";

export interface User {
    id: Types.ObjectId
    email: string,
    languages: string[],
    isAdmin: boolean,
    isVerified: boolean | undefined
}