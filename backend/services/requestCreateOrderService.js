import { applyFabricToken } from "./applyFabricTokenService.js";
import { createTimeStamp, createNonceStr, signRequestObject } from "../utils/tools.js";
import config from "../config/config.js";
import request from "request";
import db from "../db/db.js"

export const createOrder = async (req, res) => {
    const { title, amount } = req.body;

    const applyFabricTokenResult = await applyFabricToken();
    const fabricToken = applyFabricTokenResult.token;

    const createOrderResult = await requestCreateOrder(fabricToken, title, amount);

    const prepayId = createOrderResult.biz_content.prepay_id;
    const rawRequest = createRawRequest(prepayId);

    console.log("object", rawRequest)

    res.send(rawRequest);
};
function generateTxRef() {
    const timestamp = Date.now();  // Current timestamp
    const randomString = Math.random().toString(36).substring(2, 10);  // Random string
    return `${timestamp}-${randomString}`;  // Combine them to form a unique ref
}

export const requestCreateOrder = async (fabricToken, title, amount , first_name,last_name,phone_number,email) => {
    const user_name = first_name + " " + last_name
    const tx_ref = generateTxRef();
    return new Promise((resolve, reject) => {
        const reqObject = createRequestObject(title, amount);
        const options = {
            method: "POST",
            url: `https://developerportal.ethiotelebirr.et:38443/apiaccess/payment/gateway/payment/v1/merchant/preOrder`,
            headers: {
                "Content-Type": "application/json",
                "X-APP-Key": config.fabricAppId,
                Authorization: fabricToken,
            },
            rejectUnauthorized: false, // Add for HTTPS
            requestCert: false,        // Add for HTTPS
            agent: false,              // Add for HTTPS
            body: JSON.stringify(reqObject),
        };

        request(options, (error, response) => {
            if (error) {
                reject(error);
                return;
            }
            const result = JSON.parse(response.body);

            const insertQuery = `
        INSERT INTO payments (gateway, tx_ref, amount, currency, status, user_name, phone_number, email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
            const params = ['Tele Birr', tx_ref, amount, "ETB", 'Pending', user_name, phone_number, email];
            db.query(insertQuery, params);

            resolve(result);
        });

    });
};

const createRequestObject = (title, amount) => {
    const req = {
        timestamp: createTimeStamp(),
        nonce_str: createNonceStr(),
        method: "payment.preorder",
        version: "1.0",
        biz_content: {
            notify_url: "https://www.google.com",
            trade_type: "WebCheckout",
            appid: config.merchantAppId,
            merch_code: config.merchantCode,
            merch_order_id: createMerchantOrderId(),
            title: title,
            total_amount: amount,
            trans_currency: "ETB",
            timeout_express: "120m",
            payee_identifier: config.merchantCode,
            payee_identifier_type: "04",
            payee_type: "5000",
            redirect_url: "http://localhost:5173/",
        },
    };

    req.sign = signRequestObject(req);
    req.sign_type = "SHA256WithRSA";
    return req;
};

const createMerchantOrderId = () => new Date().getTime().toString();

const createRawRequest = (prepayId) => {
    const map = {
        appid: config.merchantAppId,
        merch_code: config.merchantCode,
        nonce_str: createNonceStr(),
        prepay_id: prepayId,
        timestamp: createTimeStamp(),
    };

    const sign = signRequestObject(map);

    return [
        `appid=${map.appid}`,
        `merch_code=${map.merch_code}`,
        `nonce_str=${map.nonce_str}`,
        `prepay_id=${map.prepay_id}`,
        `timestamp=${map.timestamp}`,
        `sign=${sign}`,
        "sign_type=SHA256WithRSA",
    ].join("&");
};
