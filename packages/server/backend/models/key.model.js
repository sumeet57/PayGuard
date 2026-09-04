import mongoose from "mongoose";


const keySchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
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
    label: {
        type: String,
        required: true,
        trim: true,
    },
});

const Key = mongoose.model("Key", keySchema);

export default Key;