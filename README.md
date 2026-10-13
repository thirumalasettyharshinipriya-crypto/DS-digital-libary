# DS LAB PORTAL — DATA SCIENCE DIGITAL LIBRARY

A full-stack, professional academic portal and digital library designed for college students and faculty in the Data Science department.

---

## Features

- **Dashboard**: Real-time academic metrics, student summary, recent experiments, recent projects, and quick-access shortcuts.
- **Student Profile**: Complete student record management with validation, bio, social links, photo, and resume upload.
- **Curriculum Modules**: Subject management (Python, Java, DSA, DBMS, Data Science, ML, IoT) with lesson counts and detailed syllabi.
- **Experiments & Assignments**: Comprehensive experiment records with aims, requirements, procedure steps, syntax-highlighted code, expected output, and reference links.
- **Lab Equipment Management**: Inventory tracking of workstations, edge AI boards (Jetson, Raspberry Pi), network gear, and printers with live availability indicators.
- **Interactive Tools**:
  - **CSV Viewer**: Upload or load sample datasets, sort columns, search, pagination, and export.
  - **Statistics Calculator**: Calculate mean, median, mode, min, max, range, sample & population standard deviation, variance, and IQR.
  - **JSON Formatter**: Format, validate, and minify JSON with syntax diagnostics and pre-built templates.
  - **SQL Practice**: Safe read-only sandbox executing queries on a sample educational database with instant tabular output.
- **Learning Resources**: Centralized digital library for lecture notes, research PDFs, video tutorials, and practice datasets.
- **Student Projects**: Showcase portfolios with tech stacks, live demos, GitHub repositories, and downloadable project reports.
- **Code Editor IDE**: Multi-language code editor supporting Python, Java, C, and C++ with sandboxed execution, starter code, and I/O panels.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Backend API**: Node.js Express (Dev Server) / Python Flask
- **Database**: MySQL 8.0+ / Persistent JSON Engine
- **Database Driver**: `mysql-connector-python`

---

## Installation & Running Instructions (Windows PowerShell)

### 1. Prerequisites
- Python 3.10 or higher installed with PATH configured.
- Node.js 18+ or 20+ installed.
- MySQL Server 8.0 installed and running.

### 2. Clone and Setup Environment
Open **Windows PowerShell** as Administrator or standard user:

```powershell
# Navigate to project directory
cd DS-Lab-Portal

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Setup MySQL Database
Open MySQL command line client or PowerShell:

```powershell
# Log into MySQL as root
mysql -u root -p

# Inside MySQL prompt:
CREATE DATABASE IF NOT EXISTS ds_lab CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'dslab_user'@'localhost' IDENTIFIED BY 'Password123!';
GRANT ALL PRIVILEGES ON ds_lab.* TO 'dslab_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import the database schema and seed data
mysql -u dslab_user -p ds_lab < database.sql
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

Open `.env` and configure your credentials:
```ini
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ds_lab
DB_USER=dslab_user
DB_PASSWORD=Password123!
```

### 5. Run Backend & Frontend

#### Option A: Single Command (Web Application with Express + Vite)
```powershell
npm install
npm run dev
```
Open your browser at: `http://localhost:3000`

#### Option B: Standalone Python Flask API
```powershell
python app.py
```
Flask will start at: `http://localhost:5000`

---

## Troubleshooting Common MySQL Authentication Errors

1. **`Access denied for user 'root'@'localhost'`**:
   - Solution: Ensure MySQL service is running in Windows Services (`services.msc`), or reset root password:
     ```powershell
     net start MySQL80
     ```
2. **`Client does not support authentication protocol requested by server (caching_sha2_password)`**:
   - Solution: In MySQL CLI, alter user authentication plugin:
     ```sql
     ALTER USER 'dslab_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Password123!';
     FLUSH PRIVILEGES;
     ```
3. **Port 3306 Conflict**:
   - Check if another service is using port 3306: `Get-NetTCPConnection -LocalPort 3306`

---

## Project Structure

```text
DS-Lab-Portal/
├── app.py                  # Python Flask REST API server
├── database.py             # MySQL connector pool and query helpers
├── database.sql            # MySQL schema creation and seed records
├── requirements.txt        # Python pip dependencies
├── server.ts               # Full-stack Node/Express dev server with Vite
├── .env.example            # Environment variables template
├── package.json            # Node dependencies and scripts
├── src/
│   ├── App.tsx             # Main React application shell
│   ├── components/         # Modular dashboard, tools, editor, and sections
│   ├── types/              # TypeScript interfaces for data models
│   └── main.tsx            # React application entry point
├── tests/
│   └── test_db.py          # Database and CRUD test scripts
└── uploads/                # Directory for uploaded resumes, photos, reports
```
