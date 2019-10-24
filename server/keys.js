module.exports = {
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  pgUser: process.env.PG_USER || 'postgres',
  pgHost: process.env.PG_HOST,
  pgDB: process.env.PG_DB || 'testdb',
  pgPW: process.env.PG_PASSWORD || 'postgres',
  pgPort: process.env.PG_PORT,
};