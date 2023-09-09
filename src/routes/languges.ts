import {
  postAddLanguage,
  getCSSFlashcards,
  getTypeScriptFlashcards,
  getHTMLFlashcards,
  getJavascriptFlashcards,
  getReactFlashcards,
  postAddFlashcards,
  postUpdateFlashcards,
  getReactNativeFlashcards,
} from "../controllers/lanugages";
import { isAuth } from "../middleware/isAuth";
import express from "express";
import { isAdmin } from "../middleware/isAdmin";

const router = express.Router();

router.post("/add-language", isAuth, isAdmin, postAddLanguage);
router.post("/add-flashcards", isAuth, isAdmin, postAddFlashcards);
router.post("/update-flashcards", isAuth, isAdmin, postUpdateFlashcards);

router.get("/javascript", getJavascriptFlashcards);
router.get("/html", getHTMLFlashcards);
router.get("/css", getCSSFlashcards);
router.get("/react", getReactFlashcards);
router.get("/typescript", getTypeScriptFlashcards);
router.get("/reactnative", getReactNativeFlashcards);

export = router;
