
import express from 'express';
import { createOrderController, handleInitiatePayment } from '../controller/paymentController.js';
import getAuthToken from '../controller/authController.js';
import { createOrder } from '../controller/orderController.js';

const router = express.Router();

router.post('/initiate-payment', handleInitiatePayment);
router.post("/create-payment", createOrderController);
router.post("/authToken", getAuthToken)
router.post("/createOrder", createOrder);

export default router;
