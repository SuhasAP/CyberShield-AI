from flask import Blueprint, request, jsonify
from db_models import db, User, Log
from datetime import datetime, timedelta
import random

auth_bp = Blueprint('auth', __name__)

def generate_otp():
    return "".join([str(random.randint(0, 9)) for _ in range(6)])

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'Analyst') # default Analyst
    
    if not username or not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400
        
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400
        
    otp = generate_otp()
    otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    
    user = User(
        username=username,
        email=email,
        role=role,
        otp=otp,
        otp_expiry=otp_expiry,
        is_verified=False
    )
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()
    
    # Log the security action
    log = Log(user_id=user.id, action=f"User registered. Role: {role}", ip_address=request.remote_addr)
    db.session.add(log)
    db.session.commit()
    
    print(f"\n[SECURITY ALERT] Verification OTP for {email}: {otp}\n")
    
    return jsonify({
        'message': 'Registration successful. OTP sent.',
        'email': email,
        'otp_preview_for_demo': otp # Exposed for easy presentation/testing convenience
    }), 201

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json() or {}
    email = data.get('email')
    otp = data.get('otp')
    
    if not email or not otp:
        return jsonify({'error': 'Email and OTP are required'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    if user.otp != otp:
        # Log failed attempt
        log = Log(user_id=user.id, action="Failed OTP verification attempt", ip_address=request.remote_addr)
        db.session.add(log)
        db.session.commit()
        return jsonify({'error': 'Invalid OTP code'}), 400
        
    if user.otp_expiry < datetime.utcnow():
        return jsonify({'error': 'OTP has expired'}), 400
        
    user.is_verified = True
    user.otp = None
    user.otp_expiry = None
    db.session.commit()
    
    log = Log(user_id=user.id, action="User email verified successfully", ip_address=request.remote_addr)
    db.session.add(log)
    db.session.commit()
    
    return jsonify({'message': 'OTP verification successful. You can now login.'}), 200

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
        
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        # Log security audit failure
        log = Log(action=f"Failed login attempt for email: {email}", ip_address=request.remote_addr)
        db.session.add(log)
        db.session.commit()
        return jsonify({'error': 'Invalid email or password'}), 401
        
    if not user.is_verified:
        # Re-send/generate OTP for unverified user login attempt
        otp = generate_otp()
        user.otp = otp
        user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
        db.session.commit()
        
        print(f"\n[SECURITY ALERT] New Verification OTP for {email}: {otp}\n")
        
        return jsonify({
            'error': 'Email is not verified. A new OTP has been printed to the server terminal.',
            'not_verified': True,
            'email': email,
            'otp_preview_for_demo': otp
        }), 403
        
    # Log successful login
    log = Log(user_id=user.id, action="User logged in successfully", ip_address=request.remote_addr)
    db.session.add(log)
    db.session.commit()
    
    # Generate simple mock token: "cybershield_token_<user_id>_<role>"
    token = f"cybershield_token_{user.id}_{user.role}"
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email')
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Email not registered'}), 404
        
    otp = generate_otp()
    user.otp = otp
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    db.session.commit()
    
    log = Log(user_id=user.id, action="Requested password reset OTP", ip_address=request.remote_addr)
    db.session.add(log)
    db.session.commit()
    
    print(f"\n[SECURITY ALERT] Password Reset OTP for {email}: {otp}\n")
    
    return jsonify({
        'message': 'Password reset OTP generated.',
        'email': email,
        'otp_preview_for_demo': otp
    }), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    email = data.get('email')
    otp = data.get('otp')
    new_password = data.get('new_password')
    
    if not email or not otp or not new_password:
        return jsonify({'error': 'All fields are required'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    if user.otp != otp:
        return jsonify({'error': 'Invalid OTP code'}), 400
        
    if user.otp_expiry < datetime.utcnow():
        return jsonify({'error': 'OTP has expired'}), 400
        
    user.set_password(new_password)
    user.otp = None
    user.otp_expiry = None
    db.session.commit()
    
    log = Log(user_id=user.id, action="Reset password via OTP", ip_address=request.remote_addr)
    db.session.add(log)
    db.session.commit()
    
    return jsonify({'message': 'Password has been reset successfully. Please login with your new password.'}), 200

@auth_bp.route('/change-password', methods=['POST'])
def change_password():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not user_id or not current_password or not new_password:
        return jsonify({'error': 'All fields are required'}), 400
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    if not user.check_password(current_password):
        return jsonify({'error': 'Incorrect current password'}), 400
        
    user.set_password(new_password)
    db.session.commit()
    
    log = Log(user_id=user.id, action="Changed password from profile settings", ip_address=request.remote_addr)
    db.session.add(log)
    db.session.commit()
    
    return jsonify({'message': 'Password updated successfully'}), 200
