const express = require('express');
const session = require('express-session');
const path = require('path');
const nunjucks = require('nunjucks');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const db = require('./models');

const app = express();
const port = process.env.PORT || 10000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'ems_super_secret_key_2024_arfath',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));

app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'templates'));
nunjucks.configure(path.join(__dirname, 'templates'), {
  autoescape: true,
  express: app,
});
app.use('/static', express.static(path.join(__dirname, 'static')));

app.use('/', authRoutes);
app.use('/', employeeRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

(async () => {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync({ alter: true });
    app.listen(port, () => {
      console.log(`EMS running -> http://127.0.0.1:${port}`);
      console.log('Admin -> admin@arfath.co / admin123');
      console.log('Viewer -> demo@arfath.co / demo123');
    });
  } catch (error) {
    console.error('Unable to connect to MySQL:', error);
    process.exit(1);
  }
})();
