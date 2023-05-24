import { body } from "express-validator";

export const isValidatePassword = [
    body("password", "Password must contain at least 10 characters, one uppercase, one number and one special case character")
        .trim()
        .not()
        .isEmpty()
        .isLength({ min: 10, max: 20 })
        .matches("[0-9]")
        .matches("[A-Z]")
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