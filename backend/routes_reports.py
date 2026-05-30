import os
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from db_models import db, Threat, Alert, Report, User, Log
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/generate', methods=['POST'])
def generate_report():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    title = data.get('title', f"CyberShield Security Assessment - {datetime.utcnow().strftime('%Y%m%d')}")
    
    # 1. Fetch current statistics for the PDF report contents
    total_threats = Threat.query.filter(Threat.prediction != 'Normal Traffic').count()
    total_safe = Threat.query.filter(Threat.prediction == 'Normal Traffic').count()
    total_scans = Threat.query.count()
    
    malware_count = Threat.query.filter_by(prediction='Malware').count()
    ddos_count = Threat.query.filter_by(prediction='DDoS Attack').count()
    phishing_count = Threat.query.filter_by(prediction='Phishing Attack').count()
    botnet_count = Threat.query.filter_by(prediction='Botnet Activity').count()
    
    recent_anomalies = Threat.query.filter(Threat.prediction != 'Normal Traffic')\
                                   .order_by(Threat.timestamp.desc())\
                                   .limit(10).all()
                                   
    # 2. Configure paths
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    static_dir = os.path.join(backend_dir, "static")
    reports_dir = os.path.join(static_dir, "reports")
    
    if not os.path.exists(reports_dir):
        os.makedirs(reports_dir)
        
    filename = f"cybershield_report_{int(datetime.utcnow().timestamp())}.pdf"
    pdf_path = os.path.join(reports_dir, filename)
    
    # 3. Create PDF document using ReportLab
    try:
        doc = SimpleDocTemplate(pdf_path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        story = []
        
        styles = getSampleStyleSheet()
        
        # Modify existing styles to avoid adding duplicate styles
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            textColor=colors.HexColor('#0EA5E9'), # Neon Cyan color
            spaceAfter=15,
            alignment=1 # Center aligned
        )
        
        section_heading = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            textColor=colors.HexColor('#0F172A'), # Slate
            spaceBefore=10,
            spaceAfter=8
        )
        
        body_style = ParagraphStyle(
            'BodyCustom',
            parent=styles['BodyText'],
            fontName='Helvetica',
            fontSize=10,
            spaceBefore=4,
            spaceAfter=6,
            textColor=colors.HexColor('#334155')
        )
        
        # Header / Title
        story.append(Paragraph("CYBERSHIELD AI Platform Security Audit", title_style))
        story.append(Paragraph(f"Report Generated: {datetime.utcnow().strftime('%B %d, %Y - %H:%M:%S UTC')}", body_style))
        story.append(Spacer(1, 10))
        
        # Section 1: Executive Summary
        story.append(Paragraph("1. Executive Summary", section_heading))
        summary_text = (
            f"This security telemetry assessment provides an overview of network traffic activity analyzed "
            f"by the CyberShield AI core Machine Learning classification system. Out of {total_scans} overall flow "
            f"traces processed, <b>{total_safe} ({ (total_safe/total_scans*100) if total_scans > 0 else 0:.1f}%)</b> were classified as normal "
            f"operational traffic, while <b>{total_threats}</b> threats and anomalies were detected and logged. "
            f"Mitigation actions have been suggested according to the built-in recommendation engine guidelines."
        )
        story.append(Paragraph(summary_text, body_style))
        story.append(Spacer(1, 10))
        
        # Section 2: Distribution Metrics
        story.append(Paragraph("2. Detected Attack Vectors Breakdown", section_heading))
        
        # Table of counts
        table_data = [
            [Paragraph("<b>Threat Vector</b>", body_style), Paragraph("<b>Total Incidents Logged</b>", body_style)],
            [Paragraph("Normal Base Traffic", body_style), Paragraph(str(total_safe), body_style)],
            [Paragraph("Malware", body_style), Paragraph(str(malware_count), body_style)],
            [Paragraph("DDoS Attack", body_style), Paragraph(str(ddos_count), body_style)],
            [Paragraph("Phishing Attack", body_style), Paragraph(str(phishing_count), body_style)],
            [Paragraph("Botnet Activity", body_style), Paragraph(str(botnet_count), body_style)],
        ]
        
        stat_table = Table(table_data, colWidths=[200, 150])
        stat_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (1, 0), colors.HexColor('#F1F5F9')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(stat_table)
        story.append(Spacer(1, 15))
        
        # Section 3: Recent Threat Incidents
        story.append(Paragraph("3. Detailed Security Anomalies Log (Top 10 Recent)", section_heading))
        
        flow_table_data = [
            [
                Paragraph("<b>Timestamp</b>", body_style),
                Paragraph("<b>Source IP</b>", body_style),
                Paragraph("<b>Destination IP</b>", body_style),
                Paragraph("<b>Classification</b>", body_style),
                Paragraph("<b>Risk Score</b>", body_style),
                Paragraph("<b>Status</b>", body_style)
            ]
        ]
        
        for t in recent_anomalies:
            flow_table_data.append([
                Paragraph(t.timestamp.strftime('%m/%d %H:%M'), body_style),
                Paragraph(t.source_ip, body_style),
                Paragraph(t.destination_ip, body_style),
                Paragraph(t.prediction, body_style),
                Paragraph(f"{t.risk_score:.1f}%", body_style),
                Paragraph(t.status, body_style)
            ])
            
        flow_table = Table(flow_table_data, colWidths=[75, 95, 95, 105, 55, 65])
        flow_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (5, 0), colors.HexColor('#0F172A')),
            ('TEXTCOLOR', (0, 0), (5, 0), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        
        # Invert table header text colors for readability inside PDF Paragraphs
        for i in range(6):
            flow_table_data[0][i].style.textColor = colors.white
            
        story.append(flow_table)
        story.append(Spacer(1, 15))
        
        # Section 4: Mitigation Directives
        story.append(Paragraph("4. Recommended Security Mitigation Measures", section_heading))
        recs = []
        if malware_count > 0:
            recs.append("<b>Malware Mitigation:</b> Isolate infected host nodes, trigger full offline system scans, and revoke valid API/login access tokens on targeted nodes.")
        if ddos_count > 0:
            recs.append("<b>DDoS Defense:</b> Enable local edge rate-limiting and route high-volume traffic flows through active filtering scrubbers.")
        if botnet_count > 0:
            recs.append("<b>Botnet Isolation:</b> Quarantine compromised client nodes, review anomalous service startup schedules, and restrict outbound SSH/IRC.")
        if phishing_count > 0:
            recs.append("<b>Phishing Prevention:</b> Quarantine correlated messages, initiate direct credential resets, and add malicious source links to local DNS filters.")
            
        if not recs:
            recs.append("No active mitigation measures required. Regular traffic flow scans present standard safe operations.")
            
        for rec in recs:
            story.append(Paragraph(f"- {rec}", body_style))
            
        # Build Document
        doc.build(story)
        
    except Exception as e:
        print(f"PDF creation failed: {e}")
        return jsonify({'error': f'Failed to generate PDF document: {str(e)}'}), 500
        
    # 4. Save metadata to Report table
    report = Report(
        title=title,
        generated_by=user_id,
        file_path=f"/static/reports/{filename}"
    )
    db.session.add(report)
    db.session.commit()
    
    # Log report creation
    log = Log(
        user_id=user_id,
        action=f"Security report compiled: {title}",
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'message': 'Report compiled successfully',
        'report': report.to_dict(),
        'download_url': f"/api/reports/download/{filename}"
    }), 201

@reports_bp.route('/history', methods=['GET'])
def get_reports_history():
    reports = Report.query.order_by(Report.created_at.desc()).all()
    return jsonify({
        'reports': [r.to_dict() for r in reports]
    }), 200

@reports_bp.route('/download/<filename>', methods=['GET'])
def download_report(filename):
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    reports_dir = os.path.join(backend_dir, "static", "reports")
    
    if not os.path.exists(os.path.join(reports_dir, filename)):
        return jsonify({'error': 'Report file not found'}), 404
        
    return send_from_directory(reports_dir, filename, as_attachment=True)
