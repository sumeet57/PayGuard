import crypto from "crypto";
import Key from "../models/key.model.js";

const MAX_KEYS_PER_USER = 5;

export const createApiKeyService = async (userId, label, expirationDays = 30) => {
  const existingKeysCount = await Key.countDocuments({ user: userId });

  if (existingKeysCount >= MAX_KEYS_PER_USER) {
    throw new Error(`API key limit reached. Maximum ${MAX_KEYS_PER_USER} keys allowed per user.`);
  }

  const rawKey = `pgai_${crypto.randomBytes(24).toString("hex")}`;

  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + expirationDays);

  const newKey = await Key.create({
    user: userId,
    key: rawKey,
    label,
    expirationDate,
  });

  return newKey;
};

export const getUserApiKeysService = async (userId) => {
    const keys = await Key.find({ user: userId });
    return keys;
};

export const deleteApiKeyService = async (userId, keyId) => {
  const apiKey = await Key.findOneAndDelete({ _id: keyId, user: userId });

  if (!apiKey) {
    throw new Error("API key not found or unauthorized");
  }

  return apiKey;
};

export const toggleApiKeyStatusService = async (userId, keyId) => {
  const apiKey = await Key.findOne({ _id: keyId, user: userId });

  if (!apiKey) {
    throw new Error("API key not found or unauthorized");
  }

  apiKey.valid = !apiKey.valid;
  await apiKey.save();

  return apiKey;
};