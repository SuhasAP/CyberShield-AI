from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='Analyst') # 'Admin' or 'Analyst'
    otp = db.Column(db.String(6), nullable=True)
    otp_expiry = db.Column(db.DateTime, nullable=True)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat()
        }

class Threat(db.Model):
    __tablename__ = 'threats'
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    source_ip = db.Column(db.String(45), nullable=False)
    destination_ip = db.Column(db.String(45), nullable=False)
    protocol = db.Column(db.String(10), nullable=False) # 'TCP', 'UDP', 'ICMP'
    packet_size = db.Column(db.Integer, nullable=False)
    packet_count = db.Column(db.Integer, nullable=False, default=1)
    duration = db.Column(db.Float, nullable=False)
    bytes_sent = db.Column(db.Float, nullable=False, default=0)
    bytes_received = db.Column(db.Float, nullable=False, default=0)
    ports_scanned = db.Column(db.Integer, nullable=False, default=0)
    syn_flag_count = db.Column(db.Integer, nullable=False, default=0)
    urg_flag_count = db.Column(db.Integer, nullable=False, default=0)
    latency = db.Column(db.Float, nullable=False, default=0)
    prediction = db.Column(db.String(50), nullable=False) # 'Normal Traffic', 'Malware', 'DDoS Attack', etc.
    risk_score = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='Unresolved') # 'Unresolved', 'Investigating', 'Resolved'
    notes = db.Column(db.Text, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat(),
            'source_ip': self.source_ip,
            'destination_ip': self.destination_ip,
            'protocol': self.protocol,
            'packet_size': self.packet_size,
            'packet_count': self.packet_count,
            'duration': self.duration,
            'bytes_sent': self.bytes_sent,
            'bytes_received': self.bytes_received,
            'ports_scanned': self.ports_scanned,
            'syn_flag_count': self.syn_flag_count,
            'urg_flag_count': self.urg_flag_count,
            'latency': self.latency,
            'prediction': self.prediction,
            'risk_score': self.risk_score,
            'status': self.status,
            'notes': self.notes
        }

class Report(db.Model):
    __tablename__ = 'reports'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    generated_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    file_path = db.Column(db.String(255), nullable=False)
    
    user = db.relationship('User', backref=db.backref('reports', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'generated_by': self.user.username if self.user else 'System',
            'created_at': self.created_at.isoformat(),
            'file_path': self.file_path
        }

class Alert(db.Model):
    __tablename__ = 'alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    threat_id = db.Column(db.Integer, db.ForeignKey('threats.id'), nullable=True)
    severity = db.Column(db.String(10), nullable=False) # 'High', 'Medium', 'Low'
    message = db.Column(db.Text, nullable=False)
    is_resolved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    threat = db.relationship('Threat', backref=db.backref('alerts', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'threat_id': self.threat_id,
            'severity': self.severity,
            'message': self.message,
            'is_resolved': self.is_resolved,
            'created_at': self.created_at.isoformat()
        }

class Log(db.Model):
    __tablename__ = 'logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(100), nullable=False)
    ip_address = db.Column(db.String(45), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('logs', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else 'System/Guest',
            'action': self.action,
            'ip_address': self.ip_address,
            'timestamp': self.timestamp.isoformat()
        }

class Inquiry(db.Model):
    __tablename__ = 'inquiries'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_starred = db.Column(db.Boolean, default=False)
    is_read = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'message': self.message,
            'is_starred': self.is_starred,
            'is_read': self.is_read,
            'timestamp': self.timestamp.isoformat()
        }


