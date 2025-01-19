import request from "request";
import config from "../config/config.js";

export const applyFabricToken = () => {
    return new Promise((resolve, reject) => {
        const options = {
            method: "POST",
            url: `${config.baseUrl}/payment/v1/token`,
            headers: {
                "Content-Type": "application/json",
                "X-APP-Key": config.fabricAppId,
            },
            rejectUnauthorized: false, // Add for HTTPS
            requestCert: false,        // Add for HTTPS
            agent: false,              // Add for HTTPS
            body: JSON.stringify({
                appSecret: config.appSecret,
            }),
        };

        request(options, (error, response) => {
            if (error) {
                reject(error);
                return;
            }
            const result = JSON.parse(response.body);
            resolve(result);
        });
    });
};
