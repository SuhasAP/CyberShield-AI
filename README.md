# CyberShield AI - Intelligent Threat Detection & Security Analytics Platform

CyberShield AI is an advanced, full-stack cybersecurity operations center (SOC) application that leverages a Machine Learning classifier to analyze, predict, and log network traffic anomalies. Developed with React, Tailwind CSS, Python Flask, and SQLite, it offers real-time simulated telemetry, automated security recommendation generation, role-based dashboards, and ReportLab PDF audit compiling.

---

## 🌟 Core Features

- **Inference ML Threat Classifier**: Standardizes numerical network properties and runs a Random Forest Classifier to detect:
  - *Normal Traffic*
  - *Malware Attacks*
  - *DDoS Floods*
  - *Phishing Suspicion*
  - *Botnet Node Scanning*
- **Threat Risk scoring & Recommendation Engine**: Evaluates classification probabilities to output dynamic risk percentages and context-specific mitigation directives.
- **Dynamic Security Dashboards**: Visualizes 7-day anomaly frequency charts (Line) and attack vector ratios (Doughnut) alongside live network feed simulation logs.
- **Tabular Threat Explorer**: Filter, search, and manage statuses ('Unresolved', 'Investigating', 'Resolved') and append logs annotation notes.
- **PDF Report Compiler**: Compiles current system telemetry and outstanding risks into professional PDF reports available for direct analyst download.
- **OTP Auth Enforcer**: Role-based access (Admin, Analyst) secured by email OTP verification and credential recovery reset pipelines.

---

## 🛠️ System Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Client** | React 18, Tailwind CSS, Framer Motion, Chart.js, Lucide Icons, Vite |
| **Backend API Server** | Python Flask, Flask-CORS, Flask-SQLAlchemy, ReportLab, Bcrypt, Dotenv |
| **Machine Learning** | Scikit-Learn 1.8.0+, Pandas 3.0.0+, NumPy 2.4.0+, Joblib |
| **Database Engine** | SQLite3 |

---

## 📁 Workspace Folder Structure

```text
CyberShield AI/
├── backend/
│   ├── static/reports/             # Stored compiled PDF audit documents
│   ├── app.py                      # Main Flask bootstrap server & db pre-seeder
│   ├── db_models.py                # SQLite database models
│   ├── ml_pipeline.py              # Dataset builder & RandomForest trainer
│   ├── routes_auth.py              # Blueprint routes for auth & OTP check
│   ├── routes_threats.py           # ML prediction, CSV batch upload, log update routes
│   ├── routes_dashboard.py         # Dashboard analytics & system logging routes
│   ├── routes_reports.py           # PDF compilation & downloads routes
│   ├── requirements.txt            # Python library specifications
│   ├── cybershield.db              # SQLite Database file (Auto-generated)
│   ├── network_traffic_data.csv    # Synthetic dataset CSV (Auto-generated)
│   ├── threat_model.joblib         # Serialized ML Model (Auto-generated)
│   └── scaler.joblib               # Serialized ML Scaler (Auto-generated)
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI cards, buttons, navs
│   │   │   ├── CyberButton.jsx
│   │   │   ├── GlassCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/                  # Layout screens
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── VerifyOtp.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ThreatDetector.jsx
│   │   │   ├── ThreatHistory.jsx
│   │   │   └── Profile.jsx
│   │   ├── App.jsx                 # Client router, Auth check, layout wrappers
│   │   ├── index.css               # Scanline grid graphics & styling layers
│   │   └── main.jsx                # React bootstrapper mount
│   ├── index.html                  # HTML entry point (Google Fonts imports)
│   ├── vite.config.js              # Vite server & dev api proxy config
│   ├── tailwind.config.js          # Theme extend definitions
│   ├── postcss.config.js
│   └── package.json                # Frontend package requirements
└── README.md                       # Platform documentation
```

---

## ⚡ Setup & Installation Guide

Ensure you have **Python 3.10+** and **Node.js 18+** installed on your workstation.

### Step 1: Clone & Configure Backend

1. Navigate to the project root directory:
   ```bash
   cd "CyberShield AI - Intelligent Threat Detection & Security Analytics Platform"
   ```
2. Install Python packages:
   ```bash
   python -m pip install -r backend/requirements.txt
   ```
3. Generate the training dataset and train the Machine Learning Classifier:
   ```bash
   python backend/ml_pipeline.py
   ```
   *Note: This creates `threat_model.joblib`, `scaler.joblib` and `network_traffic_data.csv` in your `backend/` folder.*
4. Start the Flask API server:
   ```bash
   python backend/app.py
   ```
   *Note: The server will run on [http://127.0.0.1:5000](http://127.0.0.1:5000) and automatically seed `cybershield.db` with user accounts and historical telemetry data.*

### Step 2: Configure Frontend Client

1. Open a new terminal session and navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Boot the Vite React client dev server:
   ```bash
   npm run dev
   ```
4. Access the CyberShield AI interface by browsing to [http://localhost:5173](http://localhost:5173).

---

## 🧪 Presentation Verification Plan

To verify the full functionality of the project for academic or evaluation reviews, follow this walkthrough:

### 1. Pre-Seeded Presentation Accounts
To bypass OTP setups during live grading, the system is bootstrapped with two pre-verified accounts:

* **Administrator Credentials**:
  - **Email**: `admin@cybershield.ai`
  - **Password**: `adminpassword`
  - **Privileges**: Full Dashboard view, resolve alerts, view audit trails.
* **Analyst Credentials**:
  - **Email**: `analyst@cybershield.ai`
  - **Password**: `analystpassword`
  - **Privileges**: Dashboard telemetry view, upload CSV, update notes.

### 2. Standard Registry & OTP Triage
1. Click **Register Analyst** on the Landing Page.
2. Complete the registration form (e.g. `test_user@cybershield.ai`).
3. An alert popup will display the generated OTP code, which is also printed to the Python server terminal.
4. Input the 6-digit code to verify the signature, and you'll be redirected to the Login page.

### 3. ML Threat Detection Test
1. Access the **Threat Detector** page on the sidebar.
2. Under **Single connection Flow Diagnostics**, edit parameters (e.g., set latency to `250` or ports scanned to `100` or syn flag count to `3000`) and click **Run AI Threat Evaluation**.
3. View the predicted attack class, risk percentage, and dynamic security recommend directives.
4. Under **Batch Traffic CSV Dataset Assessment**, click **Sample CSV** to download a pre-populated test file, then upload it. Verify that the batch summary registers the threat breakdown immediately.
5. Visit the **Threat Logs** page. Filter by the prediction type (e.g., DDoS Attack), change a status to "Investigating", and edit the analyst notes inline.
6. Input a title (e.g. "Weekly Threat Audit Summary") and click **Compile & Sign PDF Report**.
7. Locate the compiled PDF in the History table and click **Download** to inspect the ReportLab formatted security printout.
8. Navigate back to the **Dashboard** and verify that all aggregated metrics cards and line/doughnut charts have synchronized.

---

## 🛡️ Database Schema Table Definitions

### 1. `users` Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'Analyst',
    otp VARCHAR(6),
    otp_expiry DATETIME,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `threats` Table
```sql
CREATE TABLE threats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    source_ip VARCHAR(45) NOT NULL,
    destination_ip VARCHAR(45) NOT NULL,
    protocol VARCHAR(10) NOT NULL,
    packet_size INTEGER NOT NULL,
    packet_count INTEGER NOT NULL DEFAULT 1,
    duration FLOAT NOT NULL,
    bytes_sent FLOAT NOT NULL DEFAULT 0,
    bytes_received FLOAT NOT NULL DEFAULT 0,
    ports_scanned INTEGER NOT NULL DEFAULT 0,
    syn_flag_count INTEGER NOT NULL DEFAULT 0,
    urg_flag_count INTEGER NOT NULL DEFAULT 0,
    latency FLOAT NOT NULL DEFAULT 0,
    prediction VARCHAR(50) NOT NULL,
    risk_score FLOAT NOT NULL,
    status VARCHAR(20) DEFAULT 'Unresolved',
    notes TEXT
);
```

### 3. `reports` Table
```sql
CREATE TABLE reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(100) NOT NULL,
    generated_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(255) NOT NULL
);
```

### 4. `alerts` Table
```sql
CREATE TABLE alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    threat_id INTEGER REFERENCES threats(id),
    severity VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 5. `logs` Table
```sql
CREATE TABLE logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
