import { NextFunction, Request, Response } from "express";
import { LanguagesModel } from "../models/languges";
import { CustomRequest } from "../types/customRequest";

export const getJavascriptFlashcards = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const jsObject = await LanguagesModel.findOne({ language: "javascript" });
    if (!jsObject)
      return res
        .status(400)
        .json({ success: false, errors: ["Javascript flashcards not found!"] });

    return res.status(201).json({ success: true, data: jsObject.flashcards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getHTMLFlashcards = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const jsObject = await LanguagesModel.findOne({ language: "html" });
    if (!jsObject)
      return res
        .status(400)
        .json({ success: false, errors: ["Javascript flashcards not found!"] });

    return res.status(201).json({ success: true, data: jsObject.flashcards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCSSFlashcards = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const jsObject = await LanguagesModel.findOne({ language: "css" });
    if (!jsObject)
      return res
        .status(400)
        .json({ success: false, errors: ["Javascript flashcards not found!"] });

    return res.status(201).json({ success: true, data: jsObject.flashcards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getReactFlashcards = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // if (!req.user) {
  //     return res.status(404).json({ success: false, message: "No user found!" });
  // }
  // const userLanguages = req.user.languages;
  // if (!userLanguages.includes("react")) return res.status(403).json({
  //     success: false,
  //     errors: ["Unauthorized access to flashcards!"],
  // });
  // try {
  //     const reactObject = await LanguagesModel.findOne({ language: "react" });
  //     if (!reactObject) return res.status(400).json({ success: false, errors: ["React flashcards not found!"] });

  //     return res.status(200).json({ success: true, data: reactObject.flashcards });
  // } catch (err) {
  //     console.error(err);
  //     res.status(500).json({ message: "Internal Server Error" });
  // }
  try {
    const reactObject = await LanguagesModel.findOne({
      language: "react",
    });
    if (!reactObject)
      return res.status(400).json({
        success: false,
        errors: ["React flashcards not found!"],
      });

    return res
      .status(201)
      .json({ success: true, data: reactObject.flashcards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTypeScriptFlashcards = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // if (!req.user) {
  //   return res.status(404).json({ success: false, message: "No user found!" });
  // }
  // const userLanguages = req.user.languages;
  // if (!userLanguages.includes("typescript"))
  //   return res.status(403).json({
  //     success: false,
  //     errors: ["Unauthorized access to flashcards!"],
  //   });
  // try {
  //   const reactObject = await LanguagesModel.findOne({ language: "react" });
  //   if (!reactObject)
  //     return res
  //       .status(400)
  //       .json({ success: false, errors: ["React flashcards not found!"] });

  //   return res
  //     .status(200)
  //     .json({ success: true, data: reactObject.flashcards });
  // } catch (err) {
  //   console.error(err);
  //   res.status(500).json({ message: "Internal Server Error" });
  // }

  try {
    const typeScriptObject = await LanguagesModel.findOne({
      language: "typescript",
    });
    if (!typeScriptObject)
      return res.status(400).json({
        success: false,
        errors: ["TypeScript flashcards not found!"],
      });

    return res
      .status(201)
      .json({ success: true, data: typeScriptObject.flashcards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const postAddFlashcards = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const language = req.body.language;
  const newFlashcard = req.body.newFlashcard;
  console.log(newFlashcard);
  try {
    const foundLanguage = await LanguagesModel.findOne({ language: language });
    console.log(foundLanguage);
    if (!foundLanguage)
      return res
        .status(400)
        .json({ success: false, message: "Language not found" });
    const newFlashcardId = newFlashcard.id;

    const cardWithThisIDAlreadyExist = foundLanguage.flashcards.find(
      (flashcard) => flashcard.id === newFlashcardId
    );
    console.log(cardWithThisIDAlreadyExist);
    if (cardWithThisIDAlreadyExist)
      return res
        .status(400)
        .json({ success: false, message: "Flashcard already exist" });

    const flashCardsToUpdate = [...foundLanguage.flashcards, newFlashcard];
    const updatedFlashcards = await LanguagesModel.updateOne(
      { language: req.body.language },
      { flashcards: flashCardsToUpdate }
    );
    if (!updatedFlashcards)
      if (!foundLanguage)
        return res.status(400).json({
          success: false,
          message: "Something went wrong with updating flashcard",
        });
    return res
      .status(201)
      .json({ success: true, message: "Flashcards created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const postAddLanguage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const language = req.body.language;

  const lang = await LanguagesModel.create({
    language: language,
    flashcards: [],
  });
  res.status(201).json({
    message: "Language added",
  });
};

export const postUpdateFlashcards = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const language = req.body.language;
  const newFlashcard = req.body.newFlashcard;
  const id = newFlashcard.id;

  if (
    !language &&
    !id &&
    !newFlashcard.question &&
    !(newFlashcard.flashcard.length === 2)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Wrong request body" });
  }
  try {
    const foundLanguage = await LanguagesModel.findOne({ language: language });
    if (!foundLanguage)
      return res
        .status(400)
        .json({ success: false, message: "Language not found" });

    const updatedFl = foundLanguage.flashcards.map((el) => {
      if (el.id === id) {
        return newFlashcard;
      }
      return el;
    });

    const updatedFlashcards = await LanguagesModel.updateOne(
      { language: req.body.language },
      { flashcards: updatedFl }
    );
    if (!updatedFlashcards)
      if (!foundLanguage)
        return res.status(400).json({
          success: false,
          message: "Something went wrong with updating flashcard",
        });
    return res
      .status(201)
      .json({ success: true, message: "Flashcards created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
