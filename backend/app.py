import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from db_models import db, User, Threat, Alert, Log
from routes_auth import auth_bp
from routes_threats import threats_bp
from routes_dashboard import dashboard_bp
from routes_reports import reports_bp
from datetime import datetime, timedelta
import random

def create_app():
    app = Flask(__name__)
    
    # Configure absolute paths for database
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(backend_dir, "cybershield.db")
    
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'cybershield_super_secret_key_1337'
    
    # Enable CORS for frontend development server
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(threats_bp, url_prefix='/api/threats')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    
    # Initialize db
    db.init_app(app)
    
    # Base health route
    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'platform': 'CyberShield AI API Server'
        }), 200
        
    # Serve static directory (for reports)
    @app.route('/static/<path:path>')
    def serve_static(path):
        return send_from_directory(os.path.join(backend_dir, 'static'), path)

    # Seed Database Helper inside App Context
    with app.app_context():
        db.create_all()
        # Schema migration check: drop and recreate table if is_starred column does not exist
        try:
            db.session.execute(db.text("SELECT is_starred FROM inquiries LIMIT 1"))
        except Exception:
            db.session.rollback()
            print("Schema migration: dropping old inquiries table to add is_starred/is_read columns...")
            db.session.execute(db.text("DROP TABLE IF EXISTS inquiries"))
            db.session.commit()
            db.create_all()
        seed_database()
        
    return app

def seed_database():
    # Check if we already have users
    if User.query.first() is not None:
        print("Database already seeded. Skipping initialization.")
        return
        
    print("Database is empty. Seeding initial accounts and historical security telemetry...")
    
    # 1. Create Default Users (Verified for instant presentation testing)
    admin = User(
        username="admin_sec",
        email="admin@cybershield.ai",
        role="Admin",
        is_verified=True
    )
    admin.set_password("adminpassword")
    
    analyst = User(
        username="analyst_john",
        email="analyst@cybershield.ai",
        role="Analyst",
        is_verified=True
    )
    analyst.set_password("analystpassword")
    
    db.session.add(admin)
    db.session.add(analyst)
    db.session.commit() # save users to get their IDs
    
    # 2. Seed Security Audit Logs
    system_logs = [
        Log(action="System database initialized and encrypted.", ip_address="127.0.0.1"),
        Log(action="Loaded AI Threat Classification engine modules.", ip_address="127.0.0.1"),
        Log(user_id=admin.id, action="Admin account automatically created by system bootstrapper.", ip_address="127.0.0.1"),
        Log(user_id=analyst.id, action="Analyst account successfully created by system bootstrapper.", ip_address="127.0.0.1"),
    ]
    for log in system_logs:
        db.session.add(log)
        
    # 3. Seed Realistic Threat History & Alerts spread over last 7 days
    threat_types = [
        ('Normal Traffic', 15.0, 'Resolved', 'Normal baseline connection established.'),
        ('Malware', 88.5, 'Unresolved', 'Trojan behavior detected communicating with external IP.'),
        ('DDoS Attack', 96.2, 'Investigating', 'SYN flood traffic rate exceeding threshold 5000 pkts/sec.'),
        ('Phishing Attack', 74.0, 'Resolved', 'User accessed flagged phishing address spoofing login portal.'),
        ('Botnet Activity', 82.1, 'Unresolved', 'Host scanning range of ports on local network segments.')
    ]
    
    ips = [
        ('192.168.1.15', '45.76.12.98', 'TCP'),
        ('192.168.1.200', '185.190.140.2', 'UDP'),
        ('192.168.1.56', '8.8.8.8', 'ICMP'),
        ('10.0.2.14', '104.244.42.1', 'TCP'),
        ('192.168.1.42', '198.51.100.12', 'TCP'),
    ]
    
    base_time = datetime.utcnow()
    
    # We will generate 30 threats to populate charts
    for i in range(35):
        # Determine threat type index
        # 60% Normal, 10% Malware, 10% DDoS, 10% Phishing, 10% Botnet
        rand_val = random.random()
        if rand_val < 0.55:
            t_type, risk, status, note = threat_types[0] # Normal
        elif rand_val < 0.68:
            t_type, risk, status, note = threat_types[1] # Malware
        elif rand_val < 0.80:
            t_type, risk, status, note = threat_types[2] # DDoS
        elif rand_val < 0.90:
            t_type, risk, status, note = threat_types[3] # Phishing
        else:
            t_type, risk, status, note = threat_types[4] # Botnet
            
        src_ip, dest_ip, proto = random.choice(ips)
        if t_type != 'Normal Traffic':
            # override default random IP to make it look like an external threat actor
            src_ip = f"{random.randint(100, 220)}.{random.randint(10, 250)}.{random.randint(1, 254)}.{random.randint(1, 254)}"
            
        # Spread dates over last 7 days
        days_offset = random.randint(0, 6)
        hours_offset = random.randint(0, 23)
        mins_offset = random.randint(0, 59)
        t_time = base_time - timedelta(days=days_offset, hours=hours_offset, minutes=mins_offset)
        
        # Generate numeric metrics consistent with model rules
        if t_type == 'Normal Traffic':
            pkt_size = random.randint(64, 450)
            pkt_cnt = random.randint(5, 45)
            dur = round(random.uniform(0.5, 8.0), 3)
            syn = random.randint(0, 1)
            ports = random.randint(0, 1)
            lat = round(random.uniform(5.0, 45.0), 1)
        elif t_type == 'DDoS Attack':
            pkt_size = random.randint(40, 100)
            pkt_cnt = random.randint(1200, 4500)
            dur = round(random.uniform(1.0, 4.0), 3)
            syn = random.randint(1000, 4000)
            ports = random.randint(1, 2)
            lat = round(random.uniform(10.0, 90.0), 1)
        elif t_type == 'Botnet Activity':
            pkt_size = random.randint(120, 550)
            pkt_cnt = random.randint(150, 750)
            dur = round(random.uniform(15.0, 100.0), 3)
            syn = random.randint(20, 80)
            ports = random.randint(60, 400)
            lat = round(random.uniform(60.0, 220.0), 1)
        elif t_type == 'Malware':
            pkt_size = random.randint(300, 1100)
            pkt_cnt = random.randint(30, 120)
            dur = round(random.uniform(5.0, 25.0), 3)
            syn = random.randint(0, 2)
            ports = random.randint(5, 30)
            lat = round(random.uniform(85.0, 280.0), 1)
        else: # Phishing
            pkt_size = random.randint(250, 750)
            pkt_cnt = random.randint(2, 10)
            dur = round(random.uniform(0.1, 2.5), 3)
            syn = 0
            ports = random.randint(0, 1)
            lat = round(random.uniform(10.0, 35.0), 1)
            
        b_sent = pkt_size * pkt_cnt * random.uniform(0.3, 0.7)
        b_recv = pkt_size * pkt_cnt * random.uniform(0.3, 0.7)
        
        threat = Threat(
            timestamp=t_time,
            source_ip=src_ip,
            destination_ip=dest_ip,
            protocol=proto,
            packet_size=pkt_size,
            packet_count=pkt_cnt,
            duration=dur,
            bytes_sent=b_sent,
            bytes_received=b_recv,
            ports_scanned=ports,
            syn_flag_count=syn,
            urg_flag_count=random.randint(0, 1),
            latency=lat,
            prediction=t_type,
            risk_score=risk if t_type != 'Normal Traffic' else round(random.uniform(1.0, 14.5), 2),
            status=status,
            notes=note
        )
        db.session.add(threat)
        db.session.commit()
        
        # 4. Add corresponding active alerts for malicious items
        if t_type != 'Normal Traffic':
            sev = 'High' if t_type in ['DDoS Attack', 'Malware'] else 'Medium'
            alert = Alert(
                threat_id=threat.id,
                severity=sev,
                message=f"Anomalous {t_type} traffic pattern logged on flow: {src_ip} -> {dest_ip}.",
                is_resolved=(status == 'Resolved'),
                created_at=t_time
            )
            db.session.add(alert)
            db.session.commit()
            
    print("Pre-seeding successfully completed. SQLite tables are ready.")

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
