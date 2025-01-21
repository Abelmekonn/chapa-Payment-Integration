import axios from 'axios';
import process from 'process';
import request from "request";
import tools from "../utils/tools.js";

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;

/**
 * @param {string} amount - Payment amount
 * @param {string} currency - Payment currency (e.g., ETB)
 * @param {string} callbackUrl - URL for Chapa to send payment verification
 * @param {string} returnUrl - URL to redirect users after payment
 * @returns {Object} - Response containing checkout URL
 */

function generateTxRef() {
    const timestamp = Date.now();  // Current timestamp
    const randomString = Math.random().toString(36).substring(2, 10);  // Random string
    return `${timestamp}-${randomString}`;  // Combine them to form a unique ref
}

export async function initiatePayment(amount, currency, callbackUrl, returnUrl) {
    try {
        const tx_ref = generateTxRef();
        const response = await axios.post(
            'https://api.chapa.co/v1/transaction/initialize',
            {
                amount,
                currency,
                email: "abebech_bekele@gmail.com",
                first_name: "Bilen",
                last_name: "Gizachew",
                phone_number: "0912345678",
                tx_ref,
                callback_url: callbackUrl,
                return_url: returnUrl,
                customization: {
                    title: "Payment ",
                    description: "online payments"
                },
                meta: {
                    hide_receipt: "true"
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return {
            success: true,
            checkoutUrl: response.data.data.checkout_url,
        };
    } catch (error) {
        console.error('Error initiating payment:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || 'Failed to initiate payment',
        };
    }
}



export const applyFabricToken = () => {
    return new Promise((resolve, reject) => {
        const options = {
            method: "POST",
            url: `${process.env.BASE_URL}/payment/v1/token`,
            headers: {
                "Content-Type": "application/json",
                "X-APP-Key": process.env.APP_KEY,
            },
            body: JSON.stringify({ appSecret: process.env.APP_SECRET }),
        };

        request(options, (error, response) => {
            if (error) return reject(error);
            const result = JSON.parse(response.body);
            resolve(result);
        });
    });
};

export const requestAuthToken = (fabricToken, appToken) => {
    return new Promise((resolve, reject) => {
        const reqObject = createRequestObject(appToken);
        const options = {
            method: "POST",
            url: `${process.env.BASE_URL}/payment/v1/auth/authToken`,
            headers: {
                "Content-Type": "application/json",
                "X-APP-Key": process.env.APP_KEY,
                Authorization: fabricToken,
            },
            body: JSON.stringify(reqObject),
        };

        request(options, (error, response) => {
            if (error) return reject(error);
            const result = JSON.parse(response.body);
            resolve(result);
        });
    });
};

const createRequestObject = (appToken) => {
    const req = {
        timestamp: tools.createTimeStamp(),
        nonce_str: tools.createNonceStr(),
        method: "payment.authtoken",
        version: "1.0",
        biz_content: {
            access_token: appToken,
            trade_type: "InApp",
            appid: process.env.MERCHANT_ID,
            resource_type: "OpenId",
        },
    };

    req.sign = tools.signRequestObject(req);
    req.sign_type = "SHA256WithRSA";
    return req;
};
