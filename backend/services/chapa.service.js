import Payment from '../models/payment.model.js';
import process from 'process';
import axios from 'axios';

/**
 * @param {Object} paymentDetails - Payment details to be sent to Chapa.
 * @returns {Object} Chapa response and database operation status.
 */
export const initializePayment = async (paymentDetails) => {
    try {
        const response = await axios.post(
            'https://api.chapa.co/v1/transaction/initialize',
            {
                ...paymentDetails,
                payment_status: 'paid',
                return_url: "http://localhost:5173/",
                customization: {
                    title: "Payment",
                    description: "I love online payments",
                },
                callback_url: "https://webhook.site/077164d6-29cb-40df-ba29-8a00e59a7e60",
                meta:{hide_receipt:"true"}
            },
            {
                headers: {
                    Authorization: "Bearer CHASECK_TEST-S5F8xG9skgCz8TXr83C8jLYGzkh7cBvt",
                    'Content-Type': 'application/json',
                },
            }
        );

        const chapaResponse = response.data;

        if (chapaResponse.status === 'success') {
            const payment = new Payment(paymentDetails);
            const dbResponse = await payment.save();
            return { chapaResponse, dbSuccess: dbResponse !== null };
        } else {
            throw { error: 'Payment initialization failed', details: chapaResponse };
        }
    } catch (error) {
        throw error.response?.data || error;
    }
};

