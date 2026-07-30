const path = require('path');
const { Employee } = require('../models');

const USERS = {
  'admin@arfath.co': { username: 'arfath', password: 'admin123', role: 'admin' },
  'demo@arfath.co': { username: 'demo', password: 'demo123', role: 'viewer' },
};

const USER_ALIASES = Object.fromEntries(
  Object.entries(USERS).map(([email, user]) => [user.username, email])
);

const getRoleLabel = (role) => (role === 'admin' ? 'Administrator' : 'Viewer');

const buildEmployeeViewModel = (employee) => {
  const data = employee.toJSON ? employee.toJSON() : employee;
  const name = String(data.name || '').trim();
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase() || '?';
  const status = String(data.status || '');

  return {
    ...data,
    initials,
    statusClass: status.toLowerCase().replace(/\s+/g, '-'),
    idLabel: `#${String(data.id).padStart(4, '0')}`,
  };
};

const findUser = (loginId) => {
  const normalized = String(loginId || '').trim().toLowerCase();
  const email = normalized in USERS ? normalized : USER_ALIASES[normalized];
  return email ? USERS[email] : null;
};

const login = async (req, res) => {
  if (req.session.loggedIn) {
    return res.redirect('/dashboard');
  }

  if (req.method === 'POST') {
    const username = String(req.body.email || req.body.username || '').trim();
    const password = String(req.body.password || '').trim();
    const user = findUser(username);

    if (user && user.password === password) {
      req.session.loggedIn = true;
      req.session.username = user.username;
      req.session.role = user.role;
      return res.json({ status: 'ok' });
    }

    return res.status(401).json({ status: 'error', message: 'Invalid email or password.' });
  }

  res.render('login', { title: 'Sign In' });
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

const dashboard = async (req, res) => {
  const employees = await Employee.findAll({ order: [['id', 'DESC']] });
  const total = await Employee.count();
  const active = await Employee.count({ where: { status: 'Active' } });
  const onLeave = await Employee.count({ where: { status: 'On Leave' } });
  const inactive = await Employee.count({ where: { status: 'Inactive' } });
  const deptCount = await Employee.count({ distinct: true, col: 'department' });
  const role = req.session.role || 'viewer';
  const username = req.session.username || 'Admin';

  const employeeViewModels = employees.map(buildEmployeeViewModel);
  const departments = Array.from(
    new Set(employeeViewModels.map((emp) => String(emp.department || '').trim()).filter(Boolean))
  ).sort();

  res.render('dashboard', {
    employees: employeeViewModels,
    recentEmployees: employeeViewModels.slice(0, 5),
    departments,
    total,
    active,
    on_leave: onLeave,
    inactive,
    dept_count: deptCount,
    username,
    usernameInitial: String(username).charAt(0).toUpperCase(),
    role,
    roleLabel: getRoleLabel(role),
  });
};

module.exports = {
  login,
  logout,
  dashboard,
};
