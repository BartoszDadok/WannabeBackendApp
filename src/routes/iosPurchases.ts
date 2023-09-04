import express from "express";
import { verifyIOSPurchases } from "../controllers/iosPurchases";
const router = express.Router();

router.post("/verify-ios-purchases", verifyIOSPurchases);

export = router;
