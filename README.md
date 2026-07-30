# Arfath EMS

Arfath EMS is an employee management dashboard converted from a Flask + SQLite application to a Node.js + Express + MySQL stack.

## Tech Stack
- Node.js
- Express
- MySQL
- Sequelize
- Nunjucks templates
- Multer for photo uploads

## Project Structure
- `config/` – Sequelize and environment configuration
- `controllers/` – request handlers for auth and employees
- `models/` – Sequelize models
- `routes/` – Express routes
- `scripts/` – database sync helpers
- `static/` – frontend assets
- `templates/` – HTML templates

## Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a MySQL database and update `.env` using `.env.example`.
4. Run the database sync:
   ```bash
   npm run sync
   ```
5. Start the app:
   ```bash
   npm start
   ```

## Environment Variables
Create a `.env` file from `.env.example`:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `PORT`
- `SESSION_SECRET`
- `UPLOAD_DIR`

## API Endpoints
- `GET /` – login page
- `POST /` – login
- `GET /dashboard` – dashboard view
- `GET /api/employees` – list employees
- `POST /api/employees` – create employee
- `GET /api/employees/:empId` – get employee
- `PUT /api/employees/:empId` – update employee
- `DELETE /api/employees/:empId` – delete employee

## Screenshots
Add screenshots here once the UI is captured.
