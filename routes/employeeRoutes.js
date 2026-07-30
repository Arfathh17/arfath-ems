const express = require('express');
const multer = require('multer');
const {
  listEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const requireAuth = (req, res, next) => {
  if (req.session && req.session.loggedIn) {
    return next();
  }
  return res.redirect('/');
};

const requireAdmin = (req, res, next) => {
  if (req.session && req.session.loggedIn && req.session.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Access denied. Admin only.' });
};

router.get('/api/employees', requireAuth, listEmployees);
router.post('/api/employees', requireAuth, requireAdmin, upload.single('photo'), createEmployee);
router.get('/api/employees/:empId', requireAuth, getEmployee);
router.put('/api/employees/:empId', requireAuth, requireAdmin, upload.single('photo'), updateEmployee);
router.delete('/api/employees/:empId', requireAuth, requireAdmin, deleteEmployee);

module.exports = router;
