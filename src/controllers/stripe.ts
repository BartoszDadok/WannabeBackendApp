import { NextFunction, Request, Response } from "express";
import { UsersModel } from "../models/users";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const stripe = new Stripe(process.env.SECRET_STRIPE_KEY as string, {
    apiVersion: "2022-11-15",
});

export const getStripePublishableKey = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (!process.env.PUBLISHABLE_STRIPE_KEY) {
        return res.status(400).json({ success: false, errors: ["Stripe publishable key not found"] });
    }
    return res
        .status(200)
        .json({ publishableStripeKey: process.env.PUBLISHABLE_STRIPE_KEY });
};

export const postBuyReact = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        // Getting data from client
        let { id, email, languageName } = req.body;
        // Simple validation
        if (!email || !id)
            return res.status(406).json({ success: false, errors: ["All fields are required"] });

        // Initiate payment
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 500,
            currency: "USD",
            payment_method_types: ["card"],
            metadata: { id, email, languageName },
        });
        // Extracting the client secret
        const clientSecret = paymentIntent.client_secret;
        // Sending the client secret as response
        res.status(200).json({ message: "Payment initiated", clientSecret });
    } catch (err) {
        // Catch any error and send error 500 to client
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const postWebhooks = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const payload = req.body;
    const signature = req.headers["stripe-signature"];
    const endpointSecret = process.env.SECRET_STRIPE_WEBHOOK as string;
    if (!payload || !signature || !endpointSecret) {
        return res.status(400).json({ success: false, errors: ["Not found necessary data"] });
    }
    let event;

    if (endpointSecret) {
        try {
            // @ts-ignore
            event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);

            // @ts-ignore
            const { id, email, languageName } = event.data.object.metadata;

            if (event.type === "payment_intent.succeeded") {
                const user = await UsersModel.findById(id);
                if (!user) return res.status(404).json({ success: false, errors: ["User with given id doesn't exist"] });

                if (!languageName) return res.status(400).json({ success: false, errors: ["Language name not found"] });

                const isAlreadyInArray = user.languages.find((language) => language === languageName.toLowerCase());

                if (isAlreadyInArray) return res.status(201).json({
                    success: true,
                    message: `${ languageName } was already bought`,
                });
                const languagesToUpdate = [...user.languages, languageName.toLowerCase()];

                const updatedUser = await UsersModel.updateOne({ _id: id }, { languages: languagesToUpdate });
                if (!updatedUser) return res.status(400).json({
                    success: false,
                    errors: ["Something went wrong with updating user data"],
                });

                return res.status(200).json({ success: true, message: "User languages updated" });
            }

        } catch (err: any) {
            console.log(`⚠️  Webhook signature verification failed.`, err.message);
            return res.sendStatus(400);
        }
    }


};