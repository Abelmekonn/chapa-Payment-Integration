import { initializePayment } from '../services/chapa.service.js';
import pkg from 'uuid';
const { v4: uuidv4 } = pkg;


const acceptPayment = async (req, res) => {
    const { amount, currency, email, first_name, last_name, phone_number, tx_ref } = req.body;

    if (!amount || !currency || !email || !first_name || !last_name || !phone_number) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const paymentDetails = {
        amount,
        currency,
        email,
        first_name,
        last_name,
        phone_number,
        tx_ref: tx_ref || uuidv4(), 
    };

    try {
        const { chapaResponse, dbSuccess } = await initializePayment(paymentDetails);
        res.status(200).json({ success: true, chapaResponse, dbSuccess });
    } catch (error) {
        console.error('Payment Error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error });
    }
};

export default acceptPayment;
