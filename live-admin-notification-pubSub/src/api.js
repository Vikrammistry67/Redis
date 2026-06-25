import express from 'express';
import Redis from 'ioredis';
import dotenvConfig from 'dotenv';
import morgan from 'morgan';
const app = express();
dotenvConfig.config();

export const _redis = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD
});


app.use(express.json());
app.use(morgan('dev'));


app.post('/notification', async (req, res) => {
    const payload = {
        title: req.body.title || 'Default title',
        createdAt: Date.now().toString()
    };

    const reciever = await _redis.publish('notification', JSON.stringify(payload));
    return res.status(201).json({
        success: true,
        message: `Notification sent successfully ${reciever} subscriber`
    })
})


app.listen(process.env.PORT, () => console.log(`Redis Server is runnig at PORT ${process.env.PORT}`));