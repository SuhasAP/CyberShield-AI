from flask import Blueprint, jsonify, request
from db_models import db, Threat, Alert, Log, Inquiry
from sqlalchemy import func
from datetime import datetime, timedelta
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

dashboard_bp = Blueprint('dashboard', __name__)

def send_smtp_email(name, email_from, message_text):
    smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    if not smtp_user or not smtp_password:
        print("[SMTP CONFIG ALERT] SMTP credentials not set in environment. Saving inquiry locally in database only.")
        return False
        
    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = smtp_user  # Send the notification to the admin/operations mailbox
        msg['Subject'] = f"CyberShield Security Inquiry from {name}"
        
        body = f"You received a new inquiry from the CyberShield AI Landing Page:\n\n" \
               f"Name: {name}\n" \
               f"Email: {email_from}\n\n" \
               f"Message:\n{message_text}"
               
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
        print(f"SMTP Email successfully sent for inquiry from {name}")
        return True
    except Exception as e:
        print(f"Failed to send email via SMTP: {e}")
        return False

@dashboard_bp.route('/inquiries', methods=['POST'])
def create_inquiry():
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')
    
    if not name or not email or not message:
        return jsonify({'error': 'Name, email, and message are required'}), 400
        
    # Save to Database
    inquiry = Inquiry(name=name, email=email, message=message)
    db.session.add(inquiry)
    db.session.commit()
    
    # Log system event
    log = Log(
        action=f"New customer inquiry submitted by {name} ({email})",
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()
    
    # Dispatch Real SMTP Email in background
    email_sent = send_smtp_email(name, email, message)
    
    return jsonify({
        'message': 'Security inquiry submitted successfully.',
        'inquiry': inquiry.to_dict(),
        'email_dispatched': email_sent
    }), 201

@dashboard_bp.route('/inquiries', methods=['GET'])
def get_inquiries():
    inquiries = Inquiry.query.order_by(Inquiry.timestamp.desc()).all()
    return jsonify({
        'inquiries': [i.to_dict() for i in inquiries]
    }), 200

@dashboard_bp.route('/inquiries/<int:inquiry_id>/toggle-star', methods=['PUT'])
def toggle_inquiry_star(inquiry_id):
    inq = Inquiry.query.get(inquiry_id)
    if not inq:
        return jsonify({'error': 'Inquiry not found'}), 404
        
    inq.is_starred = not inq.is_starred
    db.session.commit()
    
    return jsonify({
        'message': 'Inquiry star status toggled',
        'inquiry': inq.to_dict()
    }), 200

@dashboard_bp.route('/inquiries/<int:inquiry_id>/toggle-read', methods=['PUT'])
def toggle_inquiry_read(inquiry_id):
    inq = Inquiry.query.get(inquiry_id)
    if not inq:
        return jsonify({'error': 'Inquiry not found'}), 404
        
    inq.is_read = not inq.is_read
    db.session.commit()
    
    return jsonify({
        'message': 'Inquiry read status toggled',
        'inquiry': inq.to_dict()
    }), 200

@dashboard_bp.route('/inquiries/<int:inquiry_id>', methods=['DELETE'])
def delete_inquiry(inquiry_id):
    inq = Inquiry.query.get(inquiry_id)
    if not inq:
        return jsonify({'error': 'Inquiry not found'}), 404
        
    db.session.delete(inq)
    db.session.commit()
    
    return jsonify({
        'message': 'Inquiry deleted successfully'
    }), 200

@dashboard_bp.route('/stats', methods=['GET'])
def get_dashboard_stats():
    # 1. Counter Card calculations
    total_threats = Threat.query.filter(Threat.prediction != 'Normal Traffic').count()
    total_safe = Threat.query.filter(Threat.prediction == 'Normal Traffic').count()
    
    high_alerts = Alert.query.filter_by(severity='High', is_resolved=False).count()
    medium_alerts = Alert.query.filter_by(severity='Medium', is_resolved=False).count()
    low_alerts = Alert.query.filter_by(severity='Low', is_resolved=False).count()
    
    # 2. Threat Classification Distribution
    distribution = db.session.query(
        Threat.prediction, func.count(Threat.id)
    ).group_by(Threat.prediction).all()
    
    dist_dict = {
        'Normal Traffic': 0,
        'Malware': 0,
        'DDoS Attack': 0,
        'Phishing Attack': 0,
        'Botnet Activity': 0
    }
    for label, count in distribution:
        if label in dist_dict:
            dist_dict[label] = count
            
    # 3. Timeline / Risk Trends (Last 7 days or last 12 hours depending on seed data size)
    # We will aggregate count of threats per day for the last 7 days
    today = datetime.utcnow()
    timeline = []
    
    for i in range(6, -1, -1):
        day_date = today - timedelta(days=i)
        start_date = datetime(day_date.year, day_date.month, day_date.day, 0, 0, 0)
        end_date = datetime(day_date.year, day_date.month, day_date.day, 23, 59, 59)
        
        safe_count = Threat.query.filter(
            Threat.timestamp >= start_date,
            Threat.timestamp <= end_date,
            Threat.prediction == 'Normal Traffic'
        ).count()
        
        malicious_count = Threat.query.filter(
            Threat.timestamp >= start_date,
            Threat.timestamp <= end_date,
            Threat.prediction != 'Normal Traffic'
        ).count()
        
        timeline.append({
            'date': day_date.strftime('%b %d'),
            'safe': safe_count,
            'threats': malicious_count
        })
        
    # 4. Recent Active Alerts
    recent_alerts = Alert.query.order_by(Alert.created_at.desc()).limit(8).all()
    
    # 5. Recent System Logs
    recent_logs = Log.query.order_by(Log.timestamp.desc()).limit(8).all()
    
    return jsonify({
        'cards': {
            'total_threats': total_threats,
            'total_safe_traffic': total_safe,
            'high_risk_alerts': high_alerts,
            'medium_risk_alerts': medium_alerts,
            'low_risk_alerts': low_alerts
        },
        'threat_distribution': dist_dict,
        'risk_trends': timeline,
        'recent_alerts': [a.to_dict() for a in recent_alerts],
        'recent_logs': [l.to_dict() for l in recent_logs]
    }), 200

@dashboard_bp.route('/logs', methods=['GET'])
def get_logs():
    limit = int(request.args.get('limit', 100))
    offset = int(request.args.get('offset', 0))
    
    logs = Log.query.order_by(Log.timestamp.desc()).limit(limit).offset(offset).all()
    total = Log.query.count()
    
    return jsonify({
        'logs': [l.to_dict() for l in logs],
        'total': total
    }), 200

@dashboard_bp.route('/alerts/<int:alert_id>/resolve', methods=['PUT'])
def resolve_alert(alert_id):
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404
        
    alert.is_resolved = True
    
    # If the alert has a matching threat, we also update threat status to resolved
    if alert.threat_id:
        threat = Threat.query.get(alert.threat_id)
        if threat:
            threat.status = 'Resolved'
            
    db.session.commit()
    
    # Log event
    user_id = request.args.get('user_id')
    log = Log(
        user_id=user_id,
        action=f"Alert resolved successfully (Alert ID: {alert.id})",
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'message': 'Alert resolved successfully',
        'alert': alert.to_dict()
    }), 200
