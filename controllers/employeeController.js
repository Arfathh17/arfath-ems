const fs = require('fs');
const path = require('path');
const { Employee } = require('../models');

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'static', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const listEmployees = async (req, res) => {
  const employees = await Employee.findAll({ order: [['id', 'DESC']] });
  res.json(employees.map((emp) => emp.toJSON()));
};

const createEmployee = async (req, res) => {
  const { name, email, department, status, phone, address, date_of_joining, salary } = req.body;
  if (!name || !email || !department) {
    return res.status(400).json({ error: 'Name, email and department are required.' });
  }

  let photoFilename = '';
  if (req.file) {
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      const safeName = email.replace('@', '_').replace(/\./g, '_') + ext;
      photoFilename = safeName;
      fs.writeFileSync(path.join(uploadDir, safeName), req.file.buffer);
    }
  }

  try {
    const employee = await Employee.create({
      name,
      email,
      department,
      status: status || 'Active',
      phone: phone || '',
      address: address || '',
      date_of_joining: date_of_joining || '',
      salary: salary || '',
      photo: photoFilename,
    });

    return res.status(201).json(employee.toJSON());
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Email already exists.' });
    }
    return res.status(500).json({ error: 'Unable to create employee.' });
  }
};

const getEmployee = async (req, res) => {
  const employee = await Employee.findByPk(req.params.empId);
  if (!employee) {
    return res.status(404).json({ error: 'Not found' });
  }

  const data = employee.toJSON();
  data.photo_url = data.photo ? `/static/uploads/${data.photo}` : '';
  return res.json(data);
};

const updateEmployee = async (req, res) => {
  const employee = await Employee.findByPk(req.params.empId);
  if (!employee) {
    return res.status(404).json({ error: 'Not found' });
  }

  const { name, email, department, status, phone, address, date_of_joining, salary } = req.body;
  if (!name || !email || !department) {
    return res.status(400).json({ error: 'Name, email and department are required.' });
  }

  let photoFilename = employee.photo || '';
  if (req.file) {
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      const safeName = email.replace('@', '_').replace(/\./g, '_') + ext;
      photoFilename = safeName;
      fs.writeFileSync(path.join(uploadDir, safeName), req.file.buffer);
    }
  }

  try {
    await employee.update({
      name,
      email,
      department,
      status: status || 'Active',
      phone: phone || '',
      address: address || '',
      date_of_joining: date_of_joining || '',
      salary: salary || '',
      photo: photoFilename,
    });

    return res.json(employee.toJSON());
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Email already in use.' });
    }
    return res.status(500).json({ error: 'Unable to update employee.' });
  }
};

const deleteEmployee = async (req, res) => {
  const employee = await Employee.findByPk(req.params.empId);
  if (!employee) {
    return res.status(404).json({ error: 'Not found' });
  }

  if (employee.photo) {
    const photoPath = path.join(uploadDir, employee.photo);
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }
  }

  await employee.destroy();
  return res.json({ deleted: Number(req.params.empId) });
};

module.exports = {
  listEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
};
