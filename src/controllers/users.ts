import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { UsersModel } from "../models/users";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import nodemailerSendgrid from "nodemailer-sendgrid";
import nodemailer from "nodemailer";
import { CustomRequest } from "../types/customRequest";

dotenv.config();

const transporter = nodemailer.createTransport(
    nodemailerSendgrid({
        apiKey: process.env.SENDGRID_API_KEY as string,
    }),
);

const transporterViaGmail = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: process.env.GMAIL_LOGIN as string,
        pass: process.env.GMAIL_PASS as string,
    },
});


export const postCreateUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        if (!errors.isEmpty()) {
            const err = errors.array().map((error) => error.msg);
            return res.status(422).json({ message: "Wrong data", errors: err });
        }
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const buffer = crypto.randomBytes(32);
        const verificationToken = buffer.toString("hex");

        const user = await UsersModel.create({
            email,
            password: hashedPassword,
            isVerified: false,
            languages: ["javascript"],
            verifyUserToken: verificationToken,
            verifyUserTokenExpiration: Date.now() + 3600000,
            isAdmin: false,
        });

        await transporter.sendMail({
            to: email,
            from: "Flashcards - Wannabe Bart <bart@forwannabe.com>",
            subject: "Account verification",
            html: `
           <p>Hello, Bart here :)</p>
           <p>It is your veryfication link.</p>
           <p>Click this <a href="${ process.env.DOMAIN_URI }/verify-user/${ verificationToken }">link</a> to verify your account.</p>
        `,
        });
        return res.status(201).json({
            verificationToken: verificationToken,
            message:
                "Account verification. We have been sent you a link on your email. Click this link and verify your account.",
        });

    } catch (err: any) {
        console.log(err);
        const error = new Error(err) as any;
        error.httpStatusCode = 500;
        return next(error);
    }
};

export const postSignInUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const err = errors.array().map((error) => error.msg);
        return res.status(422).json({ message: "Wrong data", errors: err });
    }
    try {
        const user = await UsersModel.findOne({ email: email });
        if (!user)
            return res.status(404).json({
                message: "Wrong data`",
                errors: ["Wrong login or password"],
            });

        const doMatch = await bcrypt.compare(password, user.password);
        if (!doMatch)
            return res.status(401).json({
                message: "Wrong data",
                errors: ["Wrong login or password"],
            });

        if (!user.isVerified)
            return res.status(401).json({
                message: "Wrong data",
                errors: [
                    "Your account is not verified, please go to your mailbox and click verification link!",
                ],
            });

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET as string,
            { expiresIn: "180d" },
        );

        return res.status(200).json({ id: user.id, email: user.email, token, languages: user.languages });
    } catch (err: any) {
        console.log(err);
        const error = new Error(err) as any;
        error.httpStatusCode = 500;
        return next(error);
    }
};

export const getVerifyUserToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const token = req.params.token;
    if (!token)
        return res.status(404).json({ success: false, message: "No token found!" });

    try {
        const user = await UsersModel.findOne({
            verifyUserToken: token,
        });
        if (!user)
            return res.status(404).json({ success: false, message: "User with given token doesn't exist" });

        if (!user.verifyUserTokenExpiration || !user.verifyUserToken)
            return res.status(401).json({
                success: false,
                message: "There is no verification token",
            });

        if (user.verifyUserTokenExpiration > Date.now()) {
            user.isVerified = true;
            user.verifyUserToken = undefined;
            user.verifyUserTokenExpiration = undefined;
            await user.save();
            return res.status(200).send(`
            <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; margin-top: 1em; justify-content: start; align-items: center">
                <h1 style="margin: 0.1em 0">Success</h1>
                <p style="font-size: 1.1rem; margin: 0.1em 0">Your account is verified!</p>
                <p style="font-size: 1.1rem; margin: 0.1em 0"">Please refresh your FlashCards App and enjoy :)</p>
            </div>
        `);
        } else {
            return res.status(200).send(`
            <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; margin-top: 1em; justify-content: start; align-items: center">
                <h1 style="margin: 0.1em 0">Failure</h1>
                <p style="font-size: 1.1rem; margin: 0.1em 0">Your verification token expired. Click this button and send new verification email.</p>
                <a style="padding: 0.5em 2em; background-color: rgba(255,228,0,1); margin-top: 1em; text-align: center; text-decoration: none" href="${ process.env.DOMAIN_URI }/fresh-verify-user-token/${ token }">Click</a>
            </div>
            `);
        }
    } catch (err: any) {
        console.log(err);
        const error = new Error(err) as any;
        error.httpStatusCode = 500;
        return next(error);
    }
};

export const getFreshVerifyUserToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const token = req.params.token;
    if (!token)
        return res.status(404).json({ success: false, message: "No token found!" });

    try {
        const user = await UsersModel.findOne({
            verifyUserToken: token,
        });
        if (!user)
            return res.status(404).json({ success: false, message: "User with given token doesn't exist" });
        if (!user.verifyUserToken)
            return res.status(401).json({ success: false, message: "No token found!" });

        const buffer = crypto.randomBytes(32);
        const newToken = buffer.toString("hex");

        const filter = { verifyUserToken: token };
        const update = {
            verifyUserToken: newToken,
            verifyUserTokenExpiration: Date.now() + 3600000,
        };

        const updatedUser = await UsersModel.findOneAndUpdate(filter, update, {
            new: true,
        });
        if (!updatedUser)
            return res
                .status(400)
                .json({ success: false, message: "Updating user failed" });

        res.status(200).json({
            message:
                "Account verification. We have been sent you new link on your email. Click this link and verify your account.",
        });

        return transporter.sendMail({
            to: user.email,
            from: "Flashcards - Wannabe Bart <bart@forwannabe.com>",
            subject: "New verification link",
            html: `
                       <p>Hello, Bart here :)</p>
                       <p>It is your veryfication link.</p>
                       <p>Click this <a href="${ process.env.DOMAIN_URI }/verify-user/${ newToken }">link</a> to verify your account.</p>
                `,
        });
    } catch (err: any) {
        console.log(err);
        const error = new Error(err) as any;
        error.httpStatusCode = 500;
        return next(error);
    }
};

export const getResendVerificationLink = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const token = req.params.token;
    if (!token)
        return res.status(404).json({ success: false, message: "No token found!" });

    try {
        const user = await UsersModel.findOne({
            verifyUserToken: token,
        });
        if (!user)
            return res.status(404).json({ success: false, message: "User with given token doesn't exist" });
        if (!user.verifyUserToken)
            return res.status(401).json({ success: false, message: "No token found!" });
        const resendToken = user.verifyUserToken;

        res.status(200).json({
            message:
                "Account verification. We have been sent you new link on your email. Click this link and verify your account.",
        });

        return transporter.sendMail({
            to: user.email,
            from: "Flashcards - Wannabe Bart <bart@forwannabe.com>",
            subject: "New verification link",
            html: `
                       <p>Hello, Bart here :)</p>
                       <p>It is your veryfication link.</p>
                       <p>Click this <a href="${ process.env.DOMAIN_URI }/verify-user/${ resendToken }">link</a> to verify your account.</p>
                `,
        });
    } catch (err: any) {
        console.log(err);
        const error = new Error(err) as any;
        error.httpStatusCode = 500;
        return next(error);
    }
};


export const postResetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const email = req.body.email;
    if (!email) {
        return res.status(404).json({ success: false, message: "No email found" });
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const err = errors.array().map((error) => error.msg);
        return res.status(422).json({ message: "Wrong data", errors: err });
    }

    const buffer = crypto.randomBytes(32);
    const token = buffer.toString("hex");

    const user = await UsersModel.findOne({ email });
    if (!user)
        return res.status(404).json({ success: false, message: "User with given email doesn't exist" });

    user.resetPasswordToken = token;
    user.resetPasswordTokenExpiration = Date.now() + 3600000;
    await user.save();

    res.status(200).json({ message: "Email sent!" });

    return transporter.sendMail({
        to: email,
        from: "Flashcards - Wannabe Bart <bart@forwannabe.com>",
        subject: "Password reset",
        html: `
                <p>Hello, Bart here :)</p>
                <p>You reqed a password reset.</p>
                <p>Click this <a href="${ process.env.DOMAIN_URI }/reset-password-token/${ token }">link</a> to set a new password.</p>
        `,
    });
};

export const getResetPasswordToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const token = req.params.token;
    if (!token)
        return res.status(404).json({ success: false, message: "No token found!" });

    try {
        const user = await UsersModel.findOne({
            resetPasswordToken: token,
        });
        if (!user) {
            return res.status(404).json({ success: false, message: "User with given token doesn't exist" });
        }
        if (!user.resetPasswordToken || !user.resetPasswordTokenExpiration)
            return res.status(400).json({
                success: false,
                message: "There is no password verification token",
            });

        if (user.resetPasswordTokenExpiration > Date.now()) {
            user.resetPasswordToken = undefined;
            user.resetPasswordTokenExpiration = undefined;
            await user.save();

            return res.status(200).send(`
                    <htmL>
                    <head><script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script></head>
                    <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; margin-top: 1em; justify-content: start; align-items: center;">
                        <h1 style="margin: 0.1em 0">Change password</h1>
                    <div style="width:350px; display: none; flex-direction: column; margin-top: 1em; justify-content: start; align-items: center;" id="success"></div>
                        <form id="form" style="width:350px; display: flex; flex-direction: column; margin-top: 1em; justify-content: start; align-items: center;">
                            <input type="hidden" id="userId" name="userId" value="${ user._id }" />
                            <label style="width: 100%; margin-bottom: 0.1em;">New password:</label>
                            <input  style="width: 100%; height: 35px; margin-bottom: 0.4em" id="password" name="password" type="password"/>
                            <label style="width: 100%; margin-bottom: 0.1em;">Confirm password:</label>
                            <input style="width: 100%; height: 35px;" id="confirmPassword" name="confirmPassword" type="password"/>
                            <button style="border: none; padding: 1em 2em; background-color: rgba(255,228,0,1); margin-top: 0.8em; text-align: center; cursor: pointer;">Change password</button>
                        </form>
                        <p style="color: red" id="message"></p>
                        <script>
                          const form = document.getElementById("form");
                          const success = document.getElementById("success");
                          const userId = document.getElementById("userId");
                          const password = document.getElementById("password");
                          const confirmPassword = document.getElementById("confirmPassword");
                          const message = document.getElementById("message");

                          const handleForm = (e) => {
                              e.preventDefault()
                                    axios({
                                    method: 'post',
                                    url: '/change-password',
                                    data: {
                                          userId: userId.value,
                                          password: password.value,
                                          confirmPassword: confirmPassword.value
                                          }
                                    })
                                    .then((result) => {
                                        window.location = "/password-changed-success"
                                    })
                                    .catch((err) => {
                                        console.log(err)
                                        const messages = err.response.data.errors;
                                        if(!messages && !messages.length >0) return;
                                        message.innerText = "The password must be at least 10 characters long and must contain at least one digit, one letter and one nonalphanumeric character. Passwords also must be the same."
                                    })

                          }

                          form.addEventListener("submit", handleForm)
                        </script>
                    </div>
                    </htmL>
                `);
        }
    } catch (err: any) {
        console.log(err);
        const error = new Error(err) as any;
        error.httpStatusCode = 500;
        return next(error);
    }
};

export const postChangePassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const password = req.body.password;
    const userId = req.body.userId;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = errors.array().map((error) => error.msg);
        return res.status(422).json({ message: "Wrong data", errors: err });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const filter = { _id: userId };
        const update = { password: hashedPassword };

        const updatedUser = await UsersModel.findOneAndUpdate(filter, update, {
            new: true,
        });
        if (!updatedUser)
            return res.status(400).json({
                success: false,
                message: "User with given data doesn't exist or updating process failed",
            });

        return res.status(200).json({
            success: true,
            message:
                "Password changed. Please log in again in your Flashcards App with your new password!",
        });
    } catch (err: any) {
        console.log(err);
        const error = new Error(err) as any;
        error.httpStatusCode = 500;
        return next(error);
    }
};
export const getChangePasswordSuccess = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    return res.status(200).send(`
        <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; margin-top: 1em; justify-content: start; align-items: center;">
            <h1 style="margin: 0.1em 0">Success</h1>
            <p>Password changed. Please log in again in your Flashcards App with your new password!</p>
        </div>
    `);
};


export const postDeleteAccount = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const userID = req.body.id;

    if (!req.user) {
        return res.status(404).json({ success: false, message: "No user found!", errors: ["No user found!"] });
    }
    const id = req.user.id.valueOf();
    if (userID !== id) {
        return res.status(400).json({ success: false, errors: ["You are not allowed to delete this user!"] });
    }
    try {
        const user = await UsersModel.findByIdAndDelete(id);
        if (!user)
            return res.status(404).json({ success: false, message: "User not found", errors: ["No user found!"] });
        return res.status(201).json({ success: true, message: "Account deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }

};

export const getAllLanguages = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction,
) => {
    if (!req.user) {
        return res.status(404).json({ success: false, message: "No user found!" });
    }
    const userID = req.user.id;
    const user = await UsersModel.findOne({ _id: userID });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({ languages: user.languages });
};