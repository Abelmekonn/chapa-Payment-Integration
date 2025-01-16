import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    email: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone_number: { type: String, required: true },
    tx_ref: { type: String, required: true, unique: true },
    Payment_status : {
        type: String, 
        enum: ['pending', 'paid', 'failed'], 
        default: 'pending'
    }
}, { timestamps: true });

const Payment = mongoose.model('Payment', PaymentSchema);

export default Payment;
