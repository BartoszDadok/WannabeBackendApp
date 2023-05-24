import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporterViaGmail = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: process.env.GMAIL_LOGIN as string,
        pass: process.env.GMAIL_PASS as string,
    },
});

export const postContactMessage = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const name = req.body.name;
    const email = req.body.email;
    const message = req.body.message;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const err = errors.array().map((error) => error.msg);
        return res.status(422).json({ message: "Wrong data", errors: err });
    }


    await transporterViaGmail.sendMail({
        to: "<bart@forwannabe.com>",
        from: "<bartwannabeprogrammer@gmail.com>",
        subject: "Contact from Wannabe App",
        html: `
            <p>Name: ${ name }</p>
            <p>Email: ${ email }</p>
            <p>Message: ${ message }</p>
        `,
    });

    res.status(200).json({
        message: "Email sent",
    });
};