import { isValidateContactData } from "../middleware/isValidateContactData";
import { postContactMessage } from "../controllers/contact";
import express from "express";
const router = express.Router();

router.post("/contact", isValidateContactData, postContactMessage);


export = router;