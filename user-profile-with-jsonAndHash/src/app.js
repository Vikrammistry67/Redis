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



// api - endpoints --->
app.post('/user/:id/json', async (req, res) => {
    await _redis.set(`/user/${req.params.id}/json`, JSON.stringify(req.body));
    return res.status(201).json({
        success: true,
        message: 'saved as JSON',
    });
});


app.get('/user/:id/json', async (req, res) => {
    let rawData = await _redis.get(`/user/${req.params.id}/json`)
    return res.status(201).json({
        success: true,
        message: 'fetched successfully as HASH as JSON',
        response: rawData ? JSON.parse(rawData) : null
    });
});


app.post('/user/:id/hash', async (req, res) => {
    await _redis.hset(`/user/${req.params.id}/hash`, req.body);
    return res.status(201).json({
        success: true,
        message: 'saved as HASH',
    });
});


app.get('/user/:id/hash', async (req, res) => {
    let hashedData = await _redis.hgetall(`/user/${req.params.id}/hash`)
    return res.status(201).json({
        success: true,
        message: 'fetched successfully as HASH',
        response: hashedData
    });
});

app.get('/user/:id/exist', async (req, res) => {
    const exists = await _redis.hexists('user', req.params.id);

    if (!exists) {
        return res.status(404).json({
            success: false,
            message: 'Data does not exist in Redis DB'
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Data exists',
        response: exists
    });
});

app.listen(process.env.PORT, () => console.log(`Redis server is running at PORT ${process.env.PORT}`))