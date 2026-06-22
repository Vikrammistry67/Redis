import dotenvConfig from 'dotenv';
import express from 'express';
import { Redis } from 'ioredis';
import morgan from 'morgan';
dotenvConfig.config();
const app = express();


// middlewares --> 
app.use(express.json());
app.use(morgan('dev'));
app.get('/health', (req, res) => res.json({ message: 'Redis server is up and working' }));


// redis-setup ---> 
const _redis = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD
});

// KEY Name (redis) -->
const QUEUE_KEY = 'queue:email';

app.post('/emails', async (req, res) => {
    const job = {
        to: req.body.to,
        subject: req.body.subject,
        body: req.body.body,
        createdAt: Date.now().toLocaleString(),
    };

    await _redis.rpush(QUEUE_KEY, JSON.stringify(job));
    return res.status(201).json({
        success: true,
        data: job
    });
});


app.get('/emails/process-one', async (req, res) => {
    let rawData = await _redis.rpop(QUEUE_KEY);

    if (!rawData) {
        console.log('no data avaiblable !')
    };

    return res.status(200).json({
        success: true,
        message: 'email sent',
        data: JSON.parse(rawData)
    });
});


app.listen(process.env.PORT, () => console.log(`Redis Server is Running at PORT ${process.env.PORT}`));