import { applyFabricToken } from "../services/applyFabricTokenService.js";
import { requestAuthToken } from "../services/authTokenService.js";

const getAuthToken = async (req, res) => {
    try {
        const appToken = req.body.authToken;
        const applyFabricTokenResult = await applyFabricToken();
        const fabricToken = applyFabricTokenResult.token;
        const result = await requestAuthToken(fabricToken, appToken);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default getAuthToken;
