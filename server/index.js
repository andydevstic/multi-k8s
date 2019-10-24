const keys = require('./keys');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();

app.use(bodyParser.json());

app.use(cors());

const pgClient = new Pool({
  host: keys.pgHost,
  port: keys.pgPort,
  database: keys.pgDB,
  password: keys.pgPW,
  user: keys.pgUser
});

pgClient.on('error', () => {
  console.log('Lost pg connection!');
});

pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT); ')
  .catch((error) => {
    console.log('Error when creating table:', error);
  });

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();

app.get('/', (req, res) => {
  res.send('Hi');
  res.end();
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM values');
  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  const values = redisClient.hgetall('values', (err, reply) => {
    if (err) {
      console.log(err);
    }
    res.send(reply);
  });
});

app.post('/values', async (req, res) => {
  try {
    const index = req.body.index;
    if (parseInt(index) > 40) {
      return res.status(422).send('Index too high');
    }
    redisClient.hset('values', index, 'Nothing yet!');
    redisPublisher.publish('insert', index);
    await pgClient.query(`INSERT INTO values (number) VALUES ($1)`, [index]);
    res.send({ working: true });
  } catch (error) {
    console.log(error)
    res.status(500).send('Internal server error');
  }
});

app.listen(5000, () => {
  console.log('I am listening on port 5000');
});