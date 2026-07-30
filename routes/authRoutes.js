const express = require('express');
const multer = require('multer');
const { login, logout, dashboard } = require('../controllers/authController');

const router = express.Router();
const upload = multer();

const requireAuth = (req, res, next) => {
  if (req.session && req.session.loggedIn) {
    return next();
  }
  return res.redirect('/');
};

router.get('/', login);
router.post('/', upload.none(), login);
router.get('/logout', logout);
router.get('/dashboard', requireAuth, dashboard);

module.exports = router;
