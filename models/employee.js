const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Active',
  },
  phone: {
    type: DataTypes.STRING(50),
    defaultValue: '',
  },
  address: {
    type: DataTypes.STRING(255),
    defaultValue: '',
  },
  date_of_joining: {
    type: DataTypes.STRING(50),
    defaultValue: '',
  },
  salary: {
    type: DataTypes.STRING(50),
    defaultValue: '',
  },
  photo: {
    type: DataTypes.STRING(255),
    defaultValue: '',
  },
}, {
  tableName: 'employees',
  timestamps: false,
});

module.exports = Employee;
