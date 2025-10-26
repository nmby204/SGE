require('dotenv').config();

const common = {
  dialect: 'postgres',
  logging: false
};

module.exports = {
  development: {
    ...common,
    host: process.env.PG_HOST || '127.0.0.1',
    port: Number(process.env.PG_PORT || 5432),
    database: process.env.PG_DB || 'DB_SGE',
    username: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres'
  },
  test: {
    ...common,
    host: process.env.PG_HOST || '127.0.0.1',
    port: Number(process.env.PG_PORT || 5432),
    database: process.env.PG_DB_TEST || 'paws_test',
    username: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres'
  },
  production: {
    ...common,
    use_env_variable: 'DATABASE_URL',
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
  }
};
