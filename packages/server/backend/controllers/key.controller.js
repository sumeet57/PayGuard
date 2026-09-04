// controllers/apiKey.controller.js
import {
  createApiKeyService,
  getUserApiKeysService,
  deleteApiKeyService,
  toggleApiKeyStatusService,
} from "../services/key.service.js";

export const createApiKey = async (req, res) => {
  try {
    const { label, expirationDays } = req.body;
    const userId = req.session.userId;

    if (!label) {
      return res.status(400).json({ success: false, message: "Label is required" });
    }

    const apiKey = await createApiKeyService(userId, label, expirationDays);

    return res.status(201).json({
      success: true,
      message: "API key generated successfully",
      data: apiKey,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getUserApiKeys = async (req, res) => {
  try {
    
    const userId = req.session.userId;
    const keys = await getUserApiKeysService(userId);

    return res.status(200).json({
      success: true,
      keys,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteApiKey = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    await deleteApiKeyService(userId, id);

    return res.status(200).json({
      success: true,
      message: "API key deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const toggleApiKeyStatus = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    const updatedKey = await toggleApiKeyStatusService(userId, id);

    return res.status(200).json({
      success: true,
      message: `API key ${updatedKey.valid ? "activated" : "deactivated"}`,
      data: updatedKey,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};