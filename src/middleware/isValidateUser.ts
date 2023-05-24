import { check, body } from "express-validator";
import { UsersModel } from "../models/users";

export const isValidateUser = [
    check("email")
        .normalizeEmail()
        .isEmail()
        .withMessage("Wrong email address")
        .bail()
        .trim()
        .escape()
        .custom((value, { req }) => {
            return UsersModel.findOne({ email: value })
                .then((user: any) => {
                    if (!user) {
                        return Promise.reject("Wrong email or password");
                    }
                    return true;
                })
                .catch((err: any) => {
                    return Promise.reject(err);
                });
        })
        .bail(),
];