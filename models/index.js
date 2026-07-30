const sequelize = require('../config/database');
const Employee = require('./employee');

const db = {
  sequelize,
  Sequelize: require('sequelize'),
  Employee,
};

module.exports = db;
