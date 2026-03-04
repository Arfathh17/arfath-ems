# =============================================================
#  EMS — Employee Management System
#  Updated: Role-based access (admin + viewer)
# =============================================================

from flask import (
    Flask, render_template, request, redirect,
    url_for, session, jsonify
)
import sqlite3, os

app = Flask(__name__)
app.secret_key = "ems_super_secret_key_2024_arfath"

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DB_PATH    = os.path.join(BASE_DIR, "employees.db")
UPLOAD_DIR = os.path.join(BASE_DIR, "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── Two users ──
USERS = {
    "arfath": {"password": "admin123", "role": "admin"},   # can do everything
    "demo":   {"password": "demo123",  "role": "viewer"},  # can only view
}


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS employees (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                name            TEXT NOT NULL,
                email           TEXT NOT NULL UNIQUE,
                department      TEXT NOT NULL,
                status          TEXT NOT NULL DEFAULT 'Active',
                phone           TEXT DEFAULT '',
                address         TEXT DEFAULT '',
                date_of_joining TEXT DEFAULT '',
                salary          TEXT DEFAULT '',
                photo           TEXT DEFAULT ''
            )
        """)
        conn.commit()

        # Safely add columns to old DB
        existing_cols = [row[1] for row in conn.execute("PRAGMA table_info(employees)").fetchall()]
        for col, defn in {
            "phone": "TEXT DEFAULT ''", "address": "TEXT DEFAULT ''",
            "date_of_joining": "TEXT DEFAULT ''", "salary": "TEXT DEFAULT ''",
            "photo": "TEXT DEFAULT ''"
        }.items():
            if col not in existing_cols:
                conn.execute(f"ALTER TABLE employees ADD COLUMN {col} {defn}")
        conn.commit()

        # Seed demo data
        if conn.execute("SELECT COUNT(*) FROM employees").fetchone()[0] == 0:
            demo = [
                ("Arfath Khan",     "arfath@company.com",  "Engineering", "Active",   "+91 98765 43210", "123 Main St, Bangalore", "2022-01-10", "75000"),
                ("Sophia Reynolds", "sophia@company.com",  "Design",      "Active",   "+91 91234 56789", "45 Park Ave, Mumbai",    "2021-06-15", "68000"),
                ("Marcus Williams", "marcus@company.com",  "Marketing",   "Active",   "+91 99887 76655", "78 Lake Road, Delhi",    "2020-03-22", "62000"),
                ("Priya Sharma",    "priya@company.com",   "HR",          "Active",   "+91 88776 54321", "9 Green St, Pune",       "2019-11-01", "58000"),
                ("Diego Ramirez",   "diego@company.com",   "Finance",     "On Leave", "+91 77665 44332", "56 Hill View, Chennai",  "2021-08-30", "71000"),
                ("Zoe Chen",        "zoe@company.com",     "Engineering", "Active",   "+91 66554 33221", "34 River Rd, Hyderabad", "2022-04-18", "80000"),
                ("Ethan Brooks",    "ethan@company.com",   "Sales",       "Inactive", "+91 55443 22110", "12 Ocean St, Kochi",     "2023-01-05", "52000"),
                ("Aiko Tanaka",     "aiko@company.com",    "Design",      "Active",   "+91 44332 11009", "67 Sky Lane, Bangalore", "2022-09-14", "65000"),
            ]
            conn.executemany("""
                INSERT INTO employees
                    (name,email,department,status,phone,address,date_of_joining,salary)
                VALUES (?,?,?,?,?,?,?,?)
            """, demo)
            conn.commit()


def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("logged_in"):
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    """Block viewers from admin-only actions."""
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("logged_in"):
            return redirect(url_for("login"))
        if session.get("role") != "admin":
            return jsonify({"error": "Access denied. Admin only."}), 403
        return f(*args, **kwargs)
    return decorated


# --------------- Routes ---------------

@app.route("/", methods=["GET", "POST"])
def login():
    if session.get("logged_in"):
        return redirect(url_for("dashboard"))
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()
        user = USERS.get(username)
        if user and user["password"] == password:
            session["logged_in"] = True
            session["username"]  = username
            session["role"]      = user["role"]   # ← save role in session
            return jsonify({"status": "ok"})
        return jsonify({"status": "error", "message": "Invalid username or password."})
    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


@app.route("/dashboard")
@login_required
def dashboard():
    with get_db() as conn:
        employees  = [dict(row) for row in conn.execute("SELECT * FROM employees ORDER BY id DESC").fetchall()]
        total      = conn.execute("SELECT COUNT(*) FROM employees").fetchone()[0]
        active     = conn.execute("SELECT COUNT(*) FROM employees WHERE status='Active'").fetchone()[0]
        on_leave   = conn.execute("SELECT COUNT(*) FROM employees WHERE status='On Leave'").fetchone()[0]
        inactive   = conn.execute("SELECT COUNT(*) FROM employees WHERE status='Inactive'").fetchone()[0]
        dept_count = conn.execute("SELECT COUNT(DISTINCT department) FROM employees").fetchone()[0]
    return render_template(
        "dashboard.html",
        employees=employees, total=total, active=active,
        on_leave=on_leave, inactive=inactive, dept_count=dept_count,
        username=session.get("username", "Admin"),
        role=session.get("role", "viewer"),   # ← pass role to template
    )


# --------------- CRUD API ---------------

@app.route("/api/employees", methods=["GET"])
@login_required
def api_list():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM employees ORDER BY id DESC").fetchall()
    return jsonify([dict(r) for r in rows])


@app.route("/api/employees", methods=["POST"])
@admin_required   # ← admin only
def api_add():
    name    = request.form.get("name",            "").strip()
    email   = request.form.get("email",           "").strip()
    dept    = request.form.get("department",      "").strip()
    stat    = request.form.get("status",          "Active").strip()
    phone   = request.form.get("phone",           "").strip()
    address = request.form.get("address",         "").strip()
    doj     = request.form.get("date_of_joining", "").strip()
    salary  = request.form.get("salary",          "").strip()

    if not name or not email or not dept:
        return jsonify({"error": "Name, email and department are required."}), 400

    photo_filename = ""
    if "photo" in request.files:
        photo = request.files["photo"]
        if photo and photo.filename:
            ext = photo.filename.rsplit(".", 1)[-1].lower()
            if ext in ["jpg", "jpeg", "png", "gif", "webp"]:
                safe_name      = email.replace("@","_").replace(".","_") + "." + ext
                photo_filename = safe_name
                photo.save(os.path.join(UPLOAD_DIR, safe_name))

    try:
        with get_db() as conn:
            cursor = conn.execute("""
                INSERT INTO employees
                    (name,email,department,status,phone,address,date_of_joining,salary,photo)
                VALUES (?,?,?,?,?,?,?,?,?)
            """, (name, email, dept, stat, phone, address, doj, salary, photo_filename))
            conn.commit()
            new_id = cursor.lastrowid
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already exists."}), 409
    return jsonify({"id": new_id, "name": name, "email": email,
                    "department": dept, "status": stat}), 201


@app.route("/api/employees/<int:emp_id>", methods=["GET"])
@login_required   # ← both admin and viewer can view
def api_get(emp_id):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM employees WHERE id=?", (emp_id,)).fetchone()
    if not row:
        return jsonify({"error": "Not found"}), 404
    emp = dict(row)
    emp["photo_url"] = url_for("static", filename="uploads/" + emp["photo"]) if emp.get("photo") else ""
    return jsonify(emp)


@app.route("/api/employees/<int:emp_id>", methods=["PUT"])
@admin_required   # ← admin only
def api_update(emp_id):
    name    = request.form.get("name",            "").strip()
    email   = request.form.get("email",           "").strip()
    dept    = request.form.get("department",      "").strip()
    stat    = request.form.get("status",          "Active").strip()
    phone   = request.form.get("phone",           "").strip()
    address = request.form.get("address",         "").strip()
    doj     = request.form.get("date_of_joining", "").strip()
    salary  = request.form.get("salary",          "").strip()

    if not name or not email or not dept:
        return jsonify({"error": "Name, email and department are required."}), 400

    with get_db() as conn:
        existing = conn.execute("SELECT photo FROM employees WHERE id=?", (emp_id,)).fetchone()
    photo_filename = existing["photo"] if existing else ""

    if "photo" in request.files:
        photo = request.files["photo"]
        if photo and photo.filename:
            ext = photo.filename.rsplit(".", 1)[-1].lower()
            if ext in ["jpg", "jpeg", "png", "gif", "webp"]:
                safe_name      = email.replace("@","_").replace(".","_") + "." + ext
                photo_filename = safe_name
                photo.save(os.path.join(UPLOAD_DIR, safe_name))

    try:
        with get_db() as conn:
            conn.execute("""
                UPDATE employees
                SET name=?,email=?,department=?,status=?,
                    phone=?,address=?,date_of_joining=?,salary=?,photo=?
                WHERE id=?
            """, (name, email, dept, stat, phone, address, doj, salary, photo_filename, emp_id))
            conn.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already in use."}), 409
    return jsonify({"id": emp_id, "name": name, "email": email,
                    "department": dept, "status": stat})


@app.route("/api/employees/<int:emp_id>", methods=["DELETE"])
@admin_required   # ← admin only
def api_delete(emp_id):
    with get_db() as conn:
        row = conn.execute("SELECT photo FROM employees WHERE id=?", (emp_id,)).fetchone()
        if row and row["photo"]:
            path = os.path.join(UPLOAD_DIR, row["photo"])
            if os.path.exists(path): os.remove(path)
        conn.execute("DELETE FROM employees WHERE id=?", (emp_id,))
        conn.commit()
    return jsonify({"deleted": emp_id})


if __name__ == "__main__":
    init_db()
    print("\n  ✅  EMS running → http://127.0.0.1:5000\n")
    print("  👑  Admin  → arfath / admin123")
    print("  👁   Viewer → demo   / demo123\n")
    app.run(host="0.0.0.0", port=10000, debug=False)