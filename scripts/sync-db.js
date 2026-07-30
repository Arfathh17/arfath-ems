require('dotenv').config();
const db = require('../models');

(async () => {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync({ alter: true });
    console.log('Database synced successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Database sync failed:', error);
    process.exit(1);
  }
})();
