import Key from "../models/key.model";

export const isValidRequest = async (req, res, next) => {
    const {apiKey} = req.headers;
    if (!apiKey) {
        return res.status(400).json({error: "API key is required"});
    }else{
        // Check if the API key is valid
        const key = await Key.findOne({key: apiKey, valid: true}).populate("user");

        if(!key) {
            return res.status(401).json({error: "Invalid or expired API key"});
        }else if (key.expirationDate < new Date()) {
            return res.status(401).json({error: "API key has expired"});
        }else{
            if(!key.user || !key.user.aiRequests || key.user.aiRequests <= 0) {
                return res.status(403).json({error: "No available AI requests"});
            }else{
                // Decrement the user's available AI requests
                key.user.aiRequests -= 1;
                await key.user.save();
                next();
            }
        }

    }
};