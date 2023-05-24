import { User } from "../types/user";
import { check, body } from "express-validator";
import { UsersModel } from "../models/users";

export const isValidateNewUser = [
    check("email")
        .normalizeEmail()
        .isEmail()
        .withMessage("Wrong email address")
        .bail()
        .trim()
        .escape()
        .custom((value: string) => {
            return new Promise((resolve, reject) => {
                UsersModel.findOne({ email: value })
                    .then((user:any) => {
                        if (user) {
                            reject("Given email is already taken");
                        }
                        return resolve(true);
                    })
                    .catch((err: any) => {
                        console.log(err);
                    });
            });
        })
        .bail(),

    body("password", "The password must be at least 10 characters long and must contain at least one digit, one letter and one nonalphanumeric character")
        .trim()
        .not()
        .isEmpty()
        .bail()
        .isLength({ min: 10, max: 20 })
        .bail()
        .matches("[0-9]")
        .bail()
        .matches("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]")
        .bail(),

    body("confirmPassword")
        .trim()
        .not()
        .isEmpty()
        .custom((value: string, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Both passwords must be the same!");
            }
            return true;
        })
        .bail(),
];