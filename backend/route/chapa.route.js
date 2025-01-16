import express from 'express';
import acceptPayment from '../controller/chapa.controller.js';

const router = express.Router();

// Define the route
router.post('/accept-payment', acceptPayment);

export default router;
