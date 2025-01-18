
import express from 'express';
import { createOrderController, handleInitiatePayment } from '../controller/paymentController.js';

const router = express.Router();

router.post('/initiate-payment', handleInitiatePayment);
router.post("/create-payment", createOrderController);

export default router;
