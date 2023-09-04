import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { UsersModel } from "../models/users";

export const verifyIOSPurchases = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { id, email, languageName, revenueCatId } = req.body;

  const config = {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${process.env.REVENUE_CAT}`,
    },
  };

  const getOfferings = await axios.get(
    `https://api.revenuecat.com/v1/subscribers/${revenueCatId}/offerings`,
    config
  );
  if (!getOfferings) {
    return res.status(400).json({
      success: false,
      errors: ["No offerings found"],
    });
  }

  const offeringsIds = getOfferings.data.offerings.map((offering: any) => {
    return offering.identifier;
  });
  if (!offeringsIds) {
    return res.status(400).json({
      success: false,
      errors: ["No identifiers found"],
    });
  }
  console.log(offeringsIds);
  const paidLanguage = offeringsIds.find(
    (off: string) => off === languageName.toLowerCase()
  );

  if (!paidLanguage) {
    return res.status(400).json({
      success: false,
      errors: ["No language found"],
    });
  }

  console.log(paidLanguage);

  const user = await UsersModel.findById(id);
  if (!user)
    return res
      .status(404)
      .json({ success: false, errors: ["User with given id doesn't exist"] });

  if (!languageName)
    return res
      .status(400)
      .json({ success: false, errors: ["Language name not found"] });

  const languagesToUpdate = [...user.languages, languageName.toLowerCase()];

  const updatedUser = await UsersModel.updateOne(
    { _id: id },
    { languages: languagesToUpdate }
  );

  if (!updatedUser)
    return res.status(400).json({
      success: false,
      errors: ["Something went wrong with updating user data"],
    });

  return res
    .status(200)
    .json({ success: true, message: "User languages updated" });
};
