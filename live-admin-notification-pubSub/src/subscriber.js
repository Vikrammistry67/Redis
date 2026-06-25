import { _redis } from './api.js';


_redis.subscribe('notification', (err) => {
    if (err) console.log(`failed to subscribe ${err.message}`);
    else console.log(`subscribed successfully ${err.message}`);
});

_redis.on('message', (channel, message) => {
    console.log(`Recieved on ${channel} : ${JSON.parse(message)}`);
});

