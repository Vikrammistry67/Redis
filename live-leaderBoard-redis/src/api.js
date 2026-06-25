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


app.post('/post/:id/view', async (req, res) => {
    const { id } = req.params.id;
    await _redis.zincrby('/postViews', 1, id);
    return res.status(200).json({
        success: true,
        message: 'View counted'
    });
});


app.post('/leaderboard/score', async (req, res) => {
    const { userId, score } = req.body;

    await await _redis.zadd('leaderboard', score, userId);

    return res.status(200).json({
        success: true,
        message: 'Score added successfully'
    });
});

app.get('/leaderboard', async (req, res) => {
    const leaderboard = await _redis.zrevrange(
        'leaderboard',
        0,
        9,
        'WITHSCORES'
    );

    return res.status(200).json({
        success: true,
        data: leaderboard
    });
});


app.get('/leaderboard/:userId/rank', async (req, res) => {
    const { userId } = req.params;

    const rank = await _redis.zrevrank(
        'leaderboard',
        userId
    );

    return res.status(200).json({
        success: true,
        userId,
        rank: rank + 1
    });
});


app.listen(process.env.PORT, () => console.log(`Redis Server is runnig at PORT ${process.env.PORT}`));
