import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    languages: {
        type: [String],
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordTokenExpiration: {
        type: Number,
    },
    isVerified: {
        type: Boolean,
    },
    verifyUserToken: {
        type: String,
    },
    verifyUserTokenExpiration: {
        type: Number,
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

export const UsersModel = mongoose.model("Users", userSchema);