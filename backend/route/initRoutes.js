import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import db from '../db/db.js';
import process from 'process';

const router = express.Router();


router.post('/initialize', async (req, res) => {
    try {
        const sqlPath = path.join(process.cwd(), 'models/initial.sql');
        const sql = await fs.readFile(sqlPath, 'utf-8');
        await db.query(sql);
        res.status(200).send({ message: 'Database initialized successfully.' });
    } catch (error) {
        console.error('Error initializing database:', error.message);
        res.status(500).send({ error: 'Database initialization failed.' });
    }
});

export default router;
