import express from 'express';
import { Redis } from 'ioredis';
import dotenvConfig from 'dotenv';
import morgan from 'morgan';
const app = express();
dotenvConfig.config();


// middlewares ---> 
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ message: 'Redis server is up and working' }));

const _redis = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD
});


const otpKey = (phone) => {
    return `otp:${phone}`;
};


app.post('/otp', async (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await _redis.set(otpKey(phone), otp, 'EX', 30); // OPT valid for 30 seconds

    return res.status(201).json({
        success: true,
        message: 'OTP sent successfully',
        otp: otp
    });
});


app.post('/otp/verify', async (req, res) => {
    const { phone, otp } = req.body;
    const storedOTP = await _redis.get(otpKey(phone));

    if (!storedOTP) {
        return res.status(200).json({
            success: false,
            message: 'OTP expired | not found'
        });
    };

    if (storedOTP !== otp) {
        return res.status(404).json({
            success: false,
            message: 'Invalid OTP'
        });
    };

    await _redis.del(otpKey(phone));
    return res.status(200).json({
        success: true,
        message: 'OTP verified successfully'
    });
});


app.get('/otp/:phone/ttl', async (req, res) => {
    const phone = req.params.phone;
    const ttl = await _redis.ttl(otpKey(phone));
    if (ttl == -2) {
        return res.status(200).json({
            message: 'OTP  expired'
        });
    }
    return res.status(200).json({
        message: ttl
    });
});



app.listen(process.env.PORT, () => console.log(`Redis server is running at PORT ${process.env.PORT}`));
