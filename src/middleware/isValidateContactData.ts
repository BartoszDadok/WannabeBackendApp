import { body, check } from "express-validator";

export const isValidateContactData = [
    check("email")
        .normalizeEmail()
        .isEmail()
        .withMessage("Wrong email address")
        .bail(),
    body("name", "Name is required")
        .trim()
        .not()
        .isEmpty()
        .bail(),
    body("message", "Message is required")
        .trim()
        .not()
        .isEmpty()
        .bail(),
];