import { initiatePayment} from '../services/paymentService.js';
import { requestCreateOrder, auth } from '../services/paymentService.js';


export async function handleInitiatePayment(req, res) {
    const { amount, currency, callbackUrl, returnUrl } = req.body;

    const result = await initiatePayment(amount, currency, callbackUrl, returnUrl);

    if (result.success) {
        return res.json({ checkoutUrl: result.checkoutUrl });
    } else {
        return res.status(500).json({ error: result.error });
    }
}


// Controller for creating order
export const createOrderController = async (req, res) => {
    const { nonceStr, amount, notifyUrl, redirectUrl, merchOrderId, timeoutExpress, title, businessType, payeeIdentifierType } = req.body;
    const { appKey, appSecret, merchantId, shortCode, privateKey, url } = req.app.locals; // Assuming these are set in app.locals

    try {
        const result = await requestCreateOrder(
            nonceStr, amount, notifyUrl, redirectUrl, merchOrderId, timeoutExpress, title, businessType, payeeIdentifierType,
            appKey, appSecret, merchantId, shortCode, privateKey, url
        );
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};

// Controller for auth
export const authController = async (req, res) => {
    const { token } = req.body;
    const { appKey, appSecret, merchantId, privateKey, url } = req.app.locals;

    try {
        const result = await auth(token, appKey, appSecret, merchantId, privateKey, url);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error in authentication', error: error.message });
    }
};
