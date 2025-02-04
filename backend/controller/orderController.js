import { applyFabricToken } from "../services/applyFabricTokenService.js";
import { requestCreateOrder } from "../services/requestCreateOrderService.js";

export const createOrder = async (req, res) => {
    try {
        const { title, amount,first_name,last_name,phone_number,email } = req.body;
        const applyFabricTokenResult = await applyFabricToken();
        const fabricToken = applyFabricTokenResult.token;
        const result = await requestCreateOrder(fabricToken, title, amount,first_name,last_name,phone_number,email);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
