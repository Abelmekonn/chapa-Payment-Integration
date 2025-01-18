import axios from 'axios';
import process from 'process';
import crypto from 'crypto';
import uuid from 'uuid';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { Agent } from 'https';

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;

/**
 * @param {string} amount - Payment amount
 * @param {string} currency - Payment currency (e.g., ETB)
 * @param {string} callbackUrl - URL for Chapa to send payment verification
 * @param {string} returnUrl - URL to redirect users after payment
 * @returns {Object} - Response containing checkout URL
 */
export async function initiatePayment(amount, currency, callbackUrl, returnUrl) {
    try {
        const response = await axios.post(
            'https://api.chapa.co/v1/transaction/initialize',
            {
                amount,
                currency,
                callback_url: callbackUrl,
                return_url: returnUrl,
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


// Function to apply fabric token
export const applyFabricToken = async () => {
    try {
        const response = await axios.post(
            `${process.env.API_URL}/apiaccess/payment/gateway/payment/v1/token`,
            { appSecret: process.env.APP_SECRET },
            { headers: { 'X-App-key': process.env.APP_KEY }, httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) }
        );
        return response.data;
    } catch (error) {
        console.error('Error in applyFabricToken:', error);
        throw error;
    }
};

// Function to generate the authentication token
export const auth = async (token) => {
    try {
        const fabricToken = await applyFabricToken();
        const urlAuth = `${process.env.API_URL}/apiaccess/payment/gateway/payment/v1/auth/authToken`;

        const payload = {
            timestamp: `${Math.floor(Date.now() / 1000)}`,
            method: 'payment.authtoken',
            nonce_str: uuid.v4().replace(/-/g, ''),
            biz_content: {
                access_token: token,
                trade_type: 'InApp',
                appid: process.env.MERCHANT_ID,
                resource_type: 'OpenId',
            },
            version: '1.0',
            sign_type: 'SHA256WithRSA',
        };

        const signature = sign(payload, process.env.PRIVATE_KEY_PATH);
        payload.sign = signature;

        const response = await axios.post(urlAuth, payload, {
            headers: {
                'X-App-key': process.env.APP_KEY,
                'Authorization': fabricToken.token
            },
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });

        return response.data;
    } catch (error) {
        console.error('Error in auth:', error);
        throw error;
    }
};

// Function to create an order
export const requestCreateOrder = async (nonceStr, amount, notifyUrl, redirectUrl, merchOrderId, timeoutExpress, title, businessType, payeeIdentifierType) => {
    try {
        const fabricToken = await applyFabricToken();
        const urlOrder = `${process.env.API_URL}/apiaccess/payment/gateway/payment/v1/merchant/preOrder`;

        const timestamp = `${Math.floor(Date.now() / 1000)}`;
        const payload = {
            nonce_str: nonceStr,
            biz_content: {
                notify_url: notifyUrl,
                redirect_url: redirectUrl,
                trans_currency: 'ETB',
                total_amount: amount,
                merch_order_id: merchOrderId,
                appid: process.env.MERCHANT_ID,
                merch_code: process.env.SHORT_CODE,
                timeout_express: timeoutExpress,
                trade_type: 'InApp',
                title: title,
                business_type: businessType,
                payee_identifier: process.env.SHORT_CODE,
                payee_identifier_type: payeeIdentifierType,
                payee_type: '5000'
            },
            method: 'payment.preorder',
            version: '1.0',
            sign_type: 'SHA256WithRSA',
            timestamp: timestamp
        };

        const signature = sign(payload, process.env.PRIVATE_KEY_PATH);
        payload.sign = signature;

        const response = await axios.post(urlOrder, payload, {
            headers: {
                'X-App-key': process.env.APP_KEY,
                'Authorization': fabricToken.token
            },
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });

        const prepayId = response.data.biz_content.prepay_id;
        const finalPayload = {
            appid: process.env.MERCHANT_ID,
            merch_code: process.env.SHORT_CODE,
            nonce_str: nonceStr,
            prepay_id: prepayId,
            timestamp: timestamp,
            sign_type: 'SHA256WithRSA',
        };

        const paySignature = sign(finalPayload, process.env.PRIVATE_KEY_PATH);
        finalPayload.sign = paySignature;

        return { response: response.data, payload: finalPayload };
    } catch (error) {
        console.error('Error in requestCreateOrder:', error);
        throw error;
    }
};

// Function to sign the payload
const sign = (payload, privateKeyPath) => {
    const data = stringifyPayload(payload);
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(data);
    sign.end();

    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const privateKey = fs.readFileSync(path.resolve(__dirname, privateKeyPath), 'utf8');
    const signature = sign.sign(privateKey, 'base64');

    return signature;
};

// Function to convert the payload to query string format
const stringifyPayload = (payload) => {
    let str = '';
    for (let key in payload) {
        if (Object.prototype.hasOwnProperty.call(payload, key)) {
            str += `${key}=${JSON.stringify(payload[key]).replace(/"/g, '')}&`;
        }
    }
    return str.slice(0, -1); // Remove last '&'
};