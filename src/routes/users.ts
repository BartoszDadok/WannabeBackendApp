import express from "express";
import {
    getChangePasswordSuccess,
    getFreshVerifyUserToken, getResendVerificationLink,
    getResetPasswordToken,
    getVerifyUserToken,
    postChangePassword,
    postCreateUser, postDeleteAccount,
    postResetPassword,
    postSignInUser,
    getAllLanguages
} from "../controllers/users";
import { isValidateNewUser } from "../middleware/isValidateNewUser";
import { isValidateUser } from "../middleware/isValidateUser";
import { isAuth } from "../middleware/isAuth";
import { isValidatePassword } from "../middleware/isValidatePassword";

const router = express.Router();

router.post("/create-user", isValidateNewUser, postCreateUser);
router.post("/sign-in", isValidateUser, postSignInUser);

router.post("/reset-password", isValidateUser, postResetPassword);
router.get("/reset-password-token/:token", getResetPasswordToken);

router.post("/change-password", isValidatePassword, postChangePassword);
router.get("/password-changed-success", getChangePasswordSuccess);

router.get("/verify-user/:token", getVerifyUserToken);
router.get("/fresh-verify-user-token/:token", getFreshVerifyUserToken);
router.get("/resend-verification-link/:token", getResendVerificationLink);

router.post("/delete-account", isAuth, postDeleteAccount);

router.get("/allLanguages", isAuth, getAllLanguages);

export = router;