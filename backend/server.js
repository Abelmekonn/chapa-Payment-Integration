import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db/db.js'; 
import initRoutes from './route/initRoutes.js'; 
import process from 'process';
import paymentRoutes from './route/paymentRoute.js';


dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));
app.options('*', cors());

// Connect to the database
(async () => {
    try {
        await db.pool.getConnection();
        console.log('Connected to the database successfully.');
    } catch (error) {
        console.error('Failed to connect to the database:', error.message);
        process.exit(1);
    }
})();


app.use('/api', initRoutes); 
// Payment routes
app.use('/api/payments', paymentRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
