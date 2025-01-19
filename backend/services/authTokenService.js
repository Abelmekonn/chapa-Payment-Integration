import { createTimeStamp, createNonceStr, signRequestObject } from "../utils/tools.js";
import config from "../config/config.js";
import request from "request";

export const requestAuthToken = async (fabricToken, appToken) => {
    return new Promise((resolve, reject) => {
        const reqObject = createRequestObject(appToken);
        console.log("object" , reqObject)
        const options = {
            method: "POST",
            url: `${config.baseUrl}/payment/v1/auth/authToken`,
            headers: {
                "Content-Type": "application/json",
                "X-APP-Key": config.fabricAppId,
                Authorization: fabricToken,
            },
            rejectUnauthorized: false, // Add for HTTPS
            requestCert: false,        // Add for HTTPS
            agent: false,              
            body: JSON.stringify(reqObject),
        };
        console.log("options :-" , options)

        request(options, (error, response) => {
            if (error) {
                reject(error);
                return;
            }
            const result = JSON.parse(response.body);
            resolve(result);
            console.log("result" , result);
            
        });
    });
};

const createRequestObject = (appToken) => {
    const req = {
        timestamp: createTimeStamp(),
        nonce_str: createNonceStr(),
        method: "payment.authtoken",
        version: "1.0",
        biz_content: {
            access_token: appToken,
            trade_type: "InApp",
            appid: config.merchantAppId,
            resource_type: "OpenId",
        },
    };

    req.sign = signRequestObject(req);
    req.sign_type = "SHA256WithRSA";
    return req;
};
