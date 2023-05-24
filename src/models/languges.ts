import mongoose from "mongoose";

const flashCardSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    flashcard: [String],
});
const languagesSchema = new mongoose.Schema({
    language: {
        type: String,
        required: true,
    },
    flashcards: {
        type: [flashCardSchema],
        required: true,
    },

});

export const LanguagesModel = mongoose.model("Languages", languagesSchema);