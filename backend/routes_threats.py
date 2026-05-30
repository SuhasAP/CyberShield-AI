import os
import io
from flask import Blueprint, request, jsonify
import pandas as pd
import numpy as np
import joblib
from db_models import db, Threat, Alert, Log

threats_bp = Blueprint('threats', __name__)

# Cache variables for ML artifacts
model = None
scaler = None
CLASSES = ['Normal Traffic', 'Malware', 'DDoS Attack', 'Phishing Attack', 'Botnet Activity']

def load_ml_resources():
    global model, scaler
    if model is not None and scaler is not None:
        return True
        
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(backend_dir, "threat_model.joblib")
    scaler_path = os.path.join(backend_dir, "scaler.joblib")
    
    if os.path.exists(model_path) and os.path.exists(scaler_path):
        try:
            model = joblib.load(model_path)
            scaler = joblib.load(scaler_path)
            return True
        except Exception as e:
            print(f"Error loading model/scaler: {e}")
            return False
    else:
        print("ML model files not found. Using simulation fallback.")
        return False

def get_recommendations(prediction):
    recommendations = {
        'Normal Traffic': [
            "No threat detected. Continue normal monitoring.",
            "Baseline traffic metrics verified against standard operations."
        ],
        'Malware': [
            "Isolate the source host immediately from the network.",
            "Run a complete malware definition scan on the target system.",
            "Revoke and reset active session tokens on infected endpoints.",
            "Update firewall filters to block Command & Control (C2) communication domains."
        ],
        'DDoS Attack': [
            "Enable rate-limiting controls on the web server or load balancer.",
            "Route traffic through traffic scrubbers to inspect and filter header anomalies.",
            "Block the identified attack IPs or source subnets at the boundary firewall.",
            "Deploy Cloudflare / CloudFront DDoS mitigation rule profiles."
        ],
        'Phishing Attack': [
            "Quarantine the suspicious email messages matching indicators of compromise.",
            "Force passwords changes for any accounts associated with incoming links.",
            "Flag the malicious landing page domain on internal DNS servers.",
            "Publish phishing warning notifications to the security operations group."
        ],
        'Botnet Activity': [
            "Quarantine the active client nodes scanning internal systems.",
            "Block outbound communication on IRC, Tor, or non-standard ports (e.g. 6667, 9001).",
            "Examine running system services for persistence keys or anomalous crontab tasks.",
            "Perform network flow analysis to detect lateral movement attempts."
        ]
    }
    return recommendations.get(prediction, ["General mitigation: Monitor closely and perform diagnostic tests."])

@threats_bp.route('/predict', methods=['POST'])
def predict_single():
    data = request.get_json() or {}
    
    # Extract features
    try:
        features = [
            float(data.get('packet_size', 0)),
            float(data.get('packet_count', 0)),
            float(data.get('duration', 0)),
            float(data.get('bytes_sent', 0)),
            float(data.get('bytes_received', 0)),
            float(data.get('ports_scanned', 0)),
            float(data.get('syn_flag_count', 0)),
            float(data.get('urg_flag_count', 0)),
            float(data.get('latency', 0))
        ]
    except (ValueError, TypeError):
        return jsonify({'error': 'All features must be numeric values'}), 400
        
    # Extract metadata
    source_ip = data.get('source_ip', '192.168.1.100')
    destination_ip = data.get('destination_ip', '10.0.0.5')
    protocol = data.get('protocol', 'TCP')
    user_id = data.get('user_id')
    
    # Load ML models
    ml_loaded = load_ml_resources()
    
    prediction_label = ""
    risk_score = 0.0
    
    if ml_loaded:
        try:
            # Reshape feature vector and scale
            features_arr = np.array([features])
            features_scaled = scaler.transform(features_arr)
            
            # Predict
            pred_idx = model.predict(features_scaled)[0]
            prediction_label = CLASSES[pred_idx]
            
            # Calculate Risk Score from Prediction Probabilities
            probs = model.predict_proba(features_scaled)[0]
            
            if prediction_label == 'Normal Traffic':
                # Risk is proportional to the non-normal classes probability
                risk_score = float((1.0 - probs[0]) * 100)
            else:
                # Risk is the probability of the predicted anomaly class * 100
                risk_score = float(probs[pred_idx] * 100)
                
            # Floor/Cap risk score logic for UI styling
            if prediction_label != 'Normal Traffic' and risk_score < 40.0:
                risk_score = 50.0 + (risk_score * 0.4) # Elevate anomalies to high/medium risk ranges
        except Exception as e:
            print(f"Prediction execution failed: {e}")
            ml_loaded = False
            
    if not ml_loaded:
        # Simulation Mode fallback if model isn't built yet
        # Simple heuristic rule classifier
        if features[6] > 100: # high syn count
            prediction_label = 'DDoS Attack'
            risk_score = min(99.9, 85.0 + (features[6] % 15.0))
        elif features[5] > 30: # ports scanned
            prediction_label = 'Botnet Activity'
            risk_score = min(95.0, 70.0 + (features[5] % 25.0))
        elif features[8] > 100: # latency
            prediction_label = 'Malware'
            risk_score = min(90.0, 60.0 + (features[8] % 30.0))
        elif features[1] < 10 and features[2] < 2: # low activity
            prediction_label = 'Phishing Attack'
            risk_score = 65.0
        else:
            prediction_label = 'Normal Traffic'
            risk_score = min(15.0, features[8] * 0.2)
            
    # Save Threat
    threat = Threat(
        source_ip=source_ip,
        destination_ip=destination_ip,
        protocol=protocol,
        packet_size=int(features[0]),
        packet_count=int(features[1]),
        duration=features[2],
        bytes_sent=features[3],
        bytes_received=features[4],
        ports_scanned=int(features[5]),
        syn_flag_count=int(features[6]),
        urg_flag_count=int(features[7]),
        latency=features[8],
        prediction=prediction_label,
        risk_score=round(risk_score, 2),
        status='Unresolved' if prediction_label != 'Normal Traffic' else 'Resolved',
        notes=f"Auto-generated prediction via ML engine."
    )
    db.session.add(threat)
    db.session.commit()
    
    # Create alert if malicious
    alert_id = None
    if prediction_label != 'Normal Traffic':
        severity = 'High' if prediction_label in ['DDoS Attack', 'Malware'] else 'Medium'
        message = f"Potential {prediction_label} detected from {source_ip} to {destination_ip}. Risk: {risk_score:.1f}%"
        
        alert = Alert(
            threat_id=threat.id,
            severity=severity,
            message=message,
            is_resolved=False
        )
        db.session.add(alert)
        db.session.commit()
        alert_id = alert.id
        
    # Log prediction action
    log = Log(
        user_id=user_id,
        action=f"Threat evaluation executed. Result: {prediction_label} (ID: {threat.id})",
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'threat': threat.to_dict(),
        'alert_id': alert_id,
        'recommendations': get_recommendations(prediction_label)
    }), 200

@threats_bp.route('/upload', methods=['POST'])
def upload_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
        
    user_id = request.form.get('user_id')
    
    try:
        # Load CSV into dataframe
        df = pd.read_csv(io.StringIO(file.stream.read().decode("UTF8")), sep=None, engine='python')
    except Exception as e:
        return jsonify({'error': f'Failed to parse CSV file: {str(e)}'}), 400
        
    required_cols = [
        'packet_size', 'packet_count', 'duration', 'bytes_sent', 'bytes_received',
        'ports_scanned', 'syn_flag_count', 'urg_flag_count', 'latency'
    ]
    
    # Check column match
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        return jsonify({'error': f'Invalid format. Missing columns: {", ".join(missing)}'}), 400
        
    ml_loaded = load_ml_resources()
    
    predictions_log = []
    normal_count = 0
    malicious_count = 0
    high_alerts = 0
    medium_alerts = 0
    
    # Iterate and predict
    for index, row in df.iterrows():
        try:
            features = [
                float(row['packet_size']),
                float(row['packet_count']),
                float(row['duration']),
                float(row['bytes_sent']),
                float(row['bytes_received']),
                float(row['ports_scanned']),
                float(row['syn_flag_count']),
                float(row['urg_flag_count']),
                float(row['latency'])
            ]
        except Exception:
            continue # skip corrupted row
            
        source_ip = str(row.get('source_ip', f"192.168.{np.random.randint(1,254)}.{np.random.randint(1,254)}"))
        destination_ip = str(row.get('destination_ip', f"10.0.0.{np.random.randint(2,254)}"))
        protocol = str(row.get('protocol', np.random.choice(['TCP', 'UDP', 'ICMP'])))
        
        prediction_label = ""
        risk_score = 0.0
        
        if ml_loaded:
            try:
                features_arr = np.array([features])
                features_scaled = scaler.transform(features_arr)
                pred_idx = model.predict(features_scaled)[0]
                prediction_label = CLASSES[pred_idx]
                
                probs = model.predict_proba(features_scaled)[0]
                if prediction_label == 'Normal Traffic':
                    risk_score = float((1.0 - probs[0]) * 100)
                else:
                    risk_score = float(probs[pred_idx] * 100)
                if prediction_label != 'Normal Traffic' and risk_score < 40.0:
                    risk_score = 50.0 + (risk_score * 0.4)
            except Exception:
                ml_loaded = False
                
        if not ml_loaded:
            # Rule based fallback
            if features[6] > 100:
                prediction_label = 'DDoS Attack'
                risk_score = min(99.9, 85.0 + (features[6] % 15.0))
            elif features[5] > 30:
                prediction_label = 'Botnet Activity'
                risk_score = min(95.0, 70.0 + (features[5] % 25.0))
            elif features[8] > 100:
                prediction_label = 'Malware'
                risk_score = min(90.0, 60.0 + (features[8] % 30.0))
            elif features[1] < 10 and features[2] < 2:
                prediction_label = 'Phishing Attack'
                risk_score = 65.0
            else:
                prediction_label = 'Normal Traffic'
                risk_score = min(15.0, features[8] * 0.2)
                
        threat = Threat(
            source_ip=source_ip,
            destination_ip=destination_ip,
            protocol=protocol,
            packet_size=int(features[0]),
            packet_count=int(features[1]),
            duration=features[2],
            bytes_sent=features[3],
            bytes_received=features[4],
            ports_scanned=int(features[5]),
            syn_flag_count=int(features[6]),
            urg_flag_count=int(features[7]),
            latency=features[8],
            prediction=prediction_label,
            risk_score=round(risk_score, 2),
            status='Unresolved' if prediction_label != 'Normal Traffic' else 'Resolved',
            notes="Processed via batch CSV file upload."
        )
        db.session.add(threat)
        db.session.commit()
        
        if prediction_label == 'Normal Traffic':
            normal_count += 1
        else:
            malicious_count += 1
            severity = 'High' if prediction_label in ['DDoS Attack', 'Malware'] else 'Medium'
            if severity == 'High':
                high_alerts += 1
            else:
                medium_alerts += 1
                
            alert = Alert(
                threat_id=threat.id,
                severity=severity,
                message=f"Batch Detect: {prediction_label} identified on flow {source_ip} -> {destination_ip}",
                is_resolved=False
            )
            db.session.add(alert)
            db.session.commit()
            
        predictions_log.append({
            'id': threat.id,
            'source_ip': source_ip,
            'destination_ip': destination_ip,
            'prediction': prediction_label,
            'risk_score': round(risk_score, 2)
        })
        
    # Log bulk event
    log = Log(
        user_id=user_id,
        action=f"Processed batch CSV threat dataset. Total: {len(predictions_log)}, Normal: {normal_count}, Anomalies: {malicious_count}",
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'message': 'CSV threat dataset processed successfully',
        'total_processed': len(predictions_log),
        'normal_traffic': normal_count,
        'threats_detected': malicious_count,
        'high_severity': high_alerts,
        'medium_severity': medium_alerts,
        'predictions': predictions_log[:50] # return top 50 for preview
    }), 200

@threats_bp.route('/history', methods=['GET'])
def get_threats_history():
    search = request.args.get('search', '')
    prediction = request.args.get('prediction', '')
    status = request.args.get('status', '')
    limit = int(request.args.get('limit', 100))
    offset = int(request.args.get('offset', 0))
    
    query = Threat.query
    
    if search:
        query = query.filter(
            (Threat.source_ip.like(f"%{search}%")) |
            (Threat.destination_ip.like(f"%{search}%")) |
            (Threat.protocol.like(f"%{search}%")) |
            (Threat.notes.like(f"%{search}%"))
        )
        
    if prediction:
        query = query.filter_by(prediction=prediction)
        
    if status:
        query = query.filter_by(status=status)
        
    # Order by timestamp descending
    total = query.count()
    threats = query.order_by(Threat.timestamp.desc()).limit(limit).offset(offset).all()
    
    return jsonify({
        'threats': [t.to_dict() for t in threats],
        'total': total,
        'limit': limit,
        'offset': offset
    }), 200

@threats_bp.route('/<int:threat_id>', methods=['GET'])
def get_threat_details(threat_id):
    threat = Threat.query.get(threat_id)
    if not threat:
        return jsonify({'error': 'Threat record not found'}), 404
        
    return jsonify({
        'threat': threat.to_dict(),
        'recommendations': get_recommendations(threat.prediction)
    }), 200

@threats_bp.route('/<int:threat_id>/update', methods=['PUT'])
def update_threat_status(threat_id):
    data = request.get_json() or {}
    status = data.get('status')
    notes = data.get('notes')
    user_id = data.get('user_id')
    
    threat = Threat.query.get(threat_id)
    if not threat:
        return jsonify({'error': 'Threat record not found'}), 404
        
    if status:
        if status not in ['Unresolved', 'Investigating', 'Resolved']:
            return jsonify({'error': 'Invalid status'}), 400
        threat.status = status
        
    if notes is not None:
        threat.notes = notes
        
    # If resolving, also resolve associated alerts
    if status == 'Resolved':
        alerts = Alert.query.filter_by(threat_id=threat.id, is_resolved=False).all()
        for alert in alerts:
            alert.is_resolved = True
            
    db.session.commit()
    
    log = Log(
        user_id=user_id,
        action=f"Threat record status update (ID: {threat.id}, Status: {threat.status})",
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'message': 'Threat updated successfully',
        'threat': threat.to_dict()
    }), 200
