const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const hasMysqlConfig = Boolean(process.env.DB_HOST || process.env.DB_USER || process.env.DB_PASSWORD || process.env.DB_NAME);
const dialect = process.env.DB_DIALECT || (hasMysqlConfig ? 'mysql' : 'sqlite');

const sequelize = new Sequelize({
  dialect,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'arfath_ems',
  storage: dialect === 'sqlite' ? (process.env.DB_STORAGE || path.join(__dirname, '..', 'data', 'ems.sqlite')) : undefined,
  logging: false,
  define: {
    timestamps: false,
    underscored: false,
  },
});

module.exports = sequelize;
