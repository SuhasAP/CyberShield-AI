import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib

def generate_synthetic_dataset(output_path, num_samples_per_class=500):
    np.random.seed(42)
    
    data = []
    
    # Class 0: Normal Traffic
    for _ in range(num_samples_per_class):
        pkt_size = np.random.uniform(64, 500)
        pkt_count = np.random.uniform(5, 50)
        duration = np.random.uniform(0.5, 10.0)
        b_sent = pkt_count * pkt_size * np.random.uniform(0.3, 0.5)
        b_recv = pkt_count * pkt_size * np.random.uniform(0.5, 0.7)
        ports = np.random.choice([0, 1, 2])
        syn_flags = np.random.choice([0, 1])
        urg_flags = np.random.choice([0, 1])
        latency = np.random.uniform(5, 50)
        
        data.append([pkt_size, pkt_count, duration, b_sent, b_recv, ports, syn_flags, urg_flags, latency, 0])
        
    # Class 1: Malware
    for _ in range(num_samples_per_class):
        pkt_size = np.random.uniform(200, 1200)
        pkt_count = np.random.uniform(20, 150)
        duration = np.random.uniform(2.0, 30.0)
        b_sent = pkt_count * pkt_size * np.random.uniform(0.7, 0.9)
        b_recv = pkt_count * pkt_size * np.random.uniform(0.1, 0.3)
        ports = np.random.randint(5, 50)
        syn_flags = np.random.randint(0, 3)
        urg_flags = np.random.randint(0, 6)
        latency = np.random.uniform(80, 300)
        
        data.append([pkt_size, pkt_count, duration, b_sent, b_recv, ports, syn_flags, urg_flags, latency, 1])
        
    # Class 2: DDoS Attack
    for _ in range(num_samples_per_class):
        pkt_size = np.random.uniform(40, 120)
        pkt_count = np.random.uniform(1000, 5000)
        duration = np.random.uniform(1.0, 5.0)
        b_sent = pkt_count * pkt_size * np.random.uniform(0.95, 0.99)
        b_recv = pkt_count * pkt_size * np.random.uniform(0.01, 0.05)
        ports = np.random.choice([1, 2])
        syn_flags = np.random.uniform(500, 4500)
        urg_flags = np.random.choice([0, 1])
        latency = np.random.uniform(10, 100)
        
        data.append([pkt_size, pkt_count, duration, b_sent, b_recv, ports, syn_flags, urg_flags, latency, 2])
        
    # Class 3: Phishing Attack
    for _ in range(num_samples_per_class):
        pkt_size = np.random.uniform(300, 800)
        pkt_count = np.random.uniform(2, 15)
        duration = np.random.uniform(0.1, 3.0)
        b_sent = pkt_count * pkt_size * np.random.uniform(0.2, 0.4)
        b_recv = pkt_count * pkt_size * np.random.uniform(0.6, 0.8)
        ports = np.random.choice([0, 1])
        syn_flags = 0
        urg_flags = 0
        latency = np.random.uniform(10, 40)
        
        data.append([pkt_size, pkt_count, duration, b_sent, b_recv, ports, syn_flags, urg_flags, latency, 3])
        
    # Class 4: Botnet Activity
    for _ in range(num_samples_per_class):
        pkt_size = np.random.uniform(100, 600)
        pkt_count = np.random.uniform(100, 800)
        duration = np.random.uniform(10.0, 120.0)
        b_sent = pkt_count * pkt_size * np.random.uniform(0.4, 0.6)
        b_recv = pkt_count * pkt_size * np.random.uniform(0.4, 0.6)
        ports = np.random.randint(50, 500)
        syn_flags = np.random.randint(10, 100)
        urg_flags = np.random.choice([0, 1, 2])
        latency = np.random.uniform(50, 250)
        
        data.append([pkt_size, pkt_count, duration, b_sent, b_recv, ports, syn_flags, urg_flags, latency, 4])
        
    columns = [
        'packet_size', 'packet_count', 'duration', 'bytes_sent', 'bytes_received',
        'ports_scanned', 'syn_flag_count', 'urg_flag_count', 'latency', 'label'
    ]
    df = pd.DataFrame(data, columns=columns)
    # Shuffle dataset
    df = df.sample(frac=1).reset_index(drop=True)
    df.to_csv(output_path, index=False)
    print(f"Dataset successfully written to: {output_path}")
    print(df['label'].value_counts())

def train_and_save_model(dataset_path, model_path, scaler_path):
    # Load dataset
    df = pd.read_csv(dataset_path)
    
    # Split features and label
    X = df.drop(columns=['label'])
    y = df['label']
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Fit scaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest Classifier
    model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=12)
    model.fit(X_train_scaled, y_train)
    
    # Evaluation
    y_pred = model.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    print(f"Model Training Accuracy: {acc * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=[
        'Normal Traffic', 'Malware', 'DDoS Attack', 'Phishing Attack', 'Botnet Activity'
    ]))
    
    # Save artifacts
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    print(f"Model saved to: {model_path}")
    print(f"Scaler saved to: {scaler_path}")

if __name__ == "__main__":
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    data_csv = os.path.join(backend_dir, "network_traffic_data.csv")
    model_joblib = os.path.join(backend_dir, "threat_model.joblib")
    scaler_joblib = os.path.join(backend_dir, "scaler.joblib")
    
    # Generate data
    generate_synthetic_dataset(data_csv)
    
    # Train model
    train_and_save_model(data_csv, model_joblib, scaler_joblib)
