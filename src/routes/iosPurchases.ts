import express from "express";
import { iosPurchases } from "../controllers/iosPurchases";
const router = express.Router();

router.post("/test-ios-purchases", iosPurchases);

export = router;
