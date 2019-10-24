const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});

// This redis connection is now in Subscription mode.
// Connections being in Subscription mode can't issue any commands not related to subscription.
// Therefore we created this separate connection for subscription purpose, away from the "functional" connection
const subscription = redisClient.duplicate();

function fib(index) {
  if (index < 2) {
    return 1;
  } else {
    return fib(index - 1) + fib(index - 2);
  }
}

subscription.on('subscribe', () => {
  console.log('Subscription is listening...');
});

subscription.on('message', (channel, message) => {
  console.log('Subscription received new message:', message);
  redisClient.hset('values', message, fib(parseInt(message)));
});

subscription.subscribe('insert');
