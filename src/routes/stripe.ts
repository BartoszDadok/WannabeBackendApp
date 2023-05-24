import { getStripePublishableKey, postBuyReact, postWebhooks } from "../controllers/stripe";
import { isAuth } from "../middleware/isAuth";
import bodyParser from "body-parser";
import express from "express";

const router = express.Router();

router.get("/stripe-publishable-key", getStripePublishableKey);
router.post("/stripe-react-payment", isAuth, postBuyReact);
router.post("/webhooks", bodyParser.raw({ type: "application/json" }), postWebhooks);

export = router;