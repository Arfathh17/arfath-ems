# 🏢 arfath.co — Employee Management System

A full-stack **Employee Management System** built with Python Flask and SQLite. Features a modern SaaS-style dashboard, animated mascot login, role-based access control, and complete employee CRUD operations.

---

## 🌐 Live Demo

🔗 **[View Live Project](https://arfath-ems.onrender.com)**

| Role   | Username | Password  | Access |
|--------|----------|-----------|--------|
| Admin  | arfath   | admin123  | Full access — Add, Edit, Delete |
| Viewer | demo     | demo123   | View only |

---

## ✨ Features

- 🤖 **Animated mascot** on login page with eye tracking
- 🔐 **Role-based access** — Admin and Viewer roles
- 📊 **Dashboard** with live employee statistics
- 👥 **Employee CRUD** — Add, Edit, Delete employees
- 👁 **Profile modal** — View full employee details
- 📸 **Photo upload** with fallback avatar
- 🔍 **Live search** and department/status filters
- 📱 **Fully responsive** — works on mobile and desktop
- 🗄️ **SQLite database** with auto-seeding
- 🌐 **REST API** for all operations

---

## 🛠️ Tech Stack

| Layer     | Technology        |
|-----------|-------------------|
| Backend   | Python, Flask     |
| Database  | SQLite (sqlite3)  |
| Frontend  | HTML, CSS, JavaScript |
| Auth      | Flask Sessions    |
| Hosting   | Render            |

---

## 🚀 Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/Arfathh17/arfath-ems.git
cd arfath-ems
```

### 2. Install dependencies
```bash
pip install flask
```

### 3. Run the app
```bash
python app.py
```

### 4. Open in browser
```
http://127.0.0.1:5000
```

---

## 📁 Project Structure

```
arfath-ems/
├── app.py                  # Flask backend + REST API
├── employees.db            # SQLite database (auto-created)
├── requirements.txt        # Dependencies
├── static/
│   ├── css/
│   │   └── style.css       # Complete design system
│   ├── js/
│   │   ├── login.js        # Mascot animations + eye tracking
│   │   └── script.js       # Dashboard CRUD + modals
│   └── uploads/            # Employee photos
└── templates/
    ├── login.html          # Login page with blob mascot
    └── dashboard.html      # Main dashboard
```

---

## 👨‍💻 Author

**Arfath** — [@Arfathh17](https://github.com/Arfathh17)

---

## 📄 License

This project is open source and available under the MIT License.