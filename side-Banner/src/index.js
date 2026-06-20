import express from 'express';
import { Redis } from 'ioredis';

const app = express();

app.use(express.json());

const _redis = new Redis({
    host: 'redis-13809.crce283.ap-south-1-2.ec2.cloud.redislabs.com',
    port: 13809,
    password: 'y3dzQGP5Bmjx8bYBS3NzrHVbLcSFfoXx'
});


const BANNER_KEY = 'app:banner';

app.get('/', (req, res) => {
    res.json({
        message: 'Redis server is up and working '
    });
})

app.post('/banner', async (req, res) => {
    await _redis.set(BANNER_KEY, req.body.message || 'welcome to Our profile');
    res.status(201).json({
        success: true,
        msg: 'Data sent successfully to Redis !'
    });
});


app.get('/getBanner', async (req, res) => {

    await _redis.get(BANNER_KEY);
    return res.status(200).json({
        success: true,
        message: 'Data fetched successfully from Redis !'
    });
});


app.delete('/deleteBanner', async (req, res) => {
    await _redis.del(BANNER_KEY);
    return res.status(200).json({
        success: true,
        message: 'Data Deleetd successfully from Redis !'
    });
});

app.get('/banner/exists', async(req, res) => {
   let isExist = await _redis.exists(BANNER_KEY);
    if (isExist) {
        return res.status(200).json({
            success: true,
            message: 'Data exists in Redis'
        });
    } else {
        return res.status(404).json({
            success: true,
            message: 'Data is not exists in Redis'
        });
    }
});

app.listen(3000, () => console.log('redis server listening at PORT 3000'));