import mongoose from "mongoose";


const keySchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    valid: {
        type: Boolean,
        default: true,
    },
    expirationDate: {
        type: Date,
        required: true,
    },
});