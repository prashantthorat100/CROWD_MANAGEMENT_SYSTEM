import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  BrainCircuit, 
  Cpu, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Layers, 
  Users, 
  MapPin, 
  Flame, 
  ShieldCheck 
} from 'lucide-react';
import axios from 'axios';

export default function App() {
  const [backendHealth, setBackendHealth] = useState({ status: 'loading', data: null });
  const [aiHealth, setAiHealth] = useState({ status: 'loading', data: null });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(new Date());

  const checkServices = async () => {
    setIsRefreshing(true);
    
    // Check Backend
    try {
      const res = await axios.get('http://localhost:5000/api/health', { timeout: 3000 });
      setBackendHealth({ status: 'healthy', data: res.data });
    } catch (err) {
      setBackendHealth({ status: 'unreachable', error: err.message });
    }

    // Check AI Service
    try {
      const res = await axios.get('http://127.0.0.1:8000/health', { timeout: 3000 });
      setAiHealth({ status: 'healthy', data: res.data });
    } catch (err) {
      setAiHealth({ status: 'unreachable', error: err.message });
    }

    setLastCheckTime(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    checkServices();
    const interval = setInterval(checkServices, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: '800',
            fontSize: '1.25rem',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
          }}>
            🚩
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                VARI SMART OPERATIONS
              </h1>
              <span className="badge badge-simulated">
                <span className="pulse-dot pulse-amber"></span>
                SIMULATED DATA ONLY
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Track 2: Crowd, Mobility & Resource Command Platform
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Last sync: {lastCheckTime.toLocaleTimeString()}
          </span>
          <button 
            className="btn btn-secondary" 
            onClick={checkServices}
            disabled={isRefreshing}
            style={{ padding: '0.5rem 0.9rem' }}
          >
            <RefreshCw size={15} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            {isRefreshing ? 'Checking...' : 'Ping Services'}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="main-content">
        {/* Project Pipeline Motto Banner */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.75rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={22} color="var(--color-brand)" />
            <span style={{ fontWeight: '700', fontSize: '0.95rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#c7d2fe' }}>
              Operational Loop
            </span>
          </div>
          <div className="pipeline-flow">
            <div className="pipeline-step active">
              <span style={{ color: '#818cf8' }}>01</span>
              <span>SENSE (YOLO/IoT)</span>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>→</span>
            <div className="pipeline-step active">
              <span style={{ color: '#818cf8' }}>02</span>
              <span>PREDICT (ML Time-Series)</span>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>→</span>
            <div className="pipeline-step active">
              <span style={{ color: '#818cf8' }}>03</span>
              <span>OPTIMIZE (Allocation Engine)</span>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>→</span>
            <div className="pipeline-step active">
              <span style={{ color: '#818cf8' }}>04</span>
              <span>ACT (Dashboard & Alerts)</span>
            </div>
          </div>
        </div>

        {/* Phase 0 Architecture Status Grid */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={18} color="#a855f7" />
          Phase 0 Tri-Server Environment Status
        </h2>

        <div className="grid-3">
          {/* Node.js + Express Backend Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #6366f1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                  <Radio size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Backend Server</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Node.js + Express + Socket.IO</p>
                </div>
              </div>
              <span className={`badge ${backendHealth.status === 'healthy' ? 'badge-live' : 'badge-simulated'}`}>
                <span className={`pulse-dot ${backendHealth.status === 'healthy' ? 'pulse-green' : 'pulse-amber'}`}></span>
                {backendHealth.status}
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
              <div>Port: <span className="telemetry-num" style={{ color: '#fff' }}>5000</span></div>
              <div>Health Endpoint: <span className="telemetry-num" style={{ color: '#818cf8' }}>/api/health</span></div>
              <div>Socket.IO Gateway: <span style={{ color: '#10b981' }}>Active</span></div>
              <div>Uptime: <span className="telemetry-num">{backendHealth.data ? `${backendHealth.data.uptimeSeconds}s` : '—'}</span></div>
            </div>
          </div>

          {/* Python + FastAPI AI Inference Service Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>AI & ML Service</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Python + FastAPI + OpenCV</p>
                </div>
              </div>
              <span className={`badge ${aiHealth.status === 'healthy' ? 'badge-live' : 'badge-simulated'}`}>
                <span className={`pulse-dot ${aiHealth.status === 'healthy' ? 'pulse-green' : 'pulse-amber'}`}></span>
                {aiHealth.status}
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
              <div>Port: <span className="telemetry-num" style={{ color: '#fff' }}>8000</span></div>
              <div>Swagger UI: <span className="telemetry-num" style={{ color: '#34d399' }}>http://127.0.0.1:8000/docs</span></div>
              <div>OpenCV Engine: <span style={{ color: aiHealth.data?.libraries?.opencv ? '#10b981' : '#f59e0b' }}>
                {aiHealth.data?.libraries?.opencv ? 'Ready' : 'Pending'}
              </span></div>
              <div>Scikit-learn: <span style={{ color: aiHealth.data?.libraries?.scikit_learn ? '#10b981' : '#f59e0b' }}>
                {aiHealth.data?.libraries?.scikit_learn ? 'Ready' : 'Pending'}
              </span></div>
            </div>
          </div>

          {/* MongoDB Database Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  <Database size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>MongoDB Database</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Community Server v8.2.5</p>
                </div>
              </div>
              <span className={`badge ${backendHealth.data?.database?.connected ? 'badge-live' : 'badge-simulated'}`}>
                <span className={`pulse-dot ${backendHealth.data?.database?.connected ? 'pulse-green' : 'pulse-amber'}`}></span>
                {backendHealth.data?.database?.connected ? 'connected' : 'connecting'}
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
              <div>Host: <span className="telemetry-num" style={{ color: '#fff' }}>127.0.0.1:27017</span></div>
              <div>Database: <span className="telemetry-num" style={{ color: '#fbbf24' }}>vari_smart_ops</span></div>
              <div>Mongoose State: <span style={{ color: '#10b981' }}>{backendHealth.data?.database?.connected ? 'Connected (State 1)' : 'Idle'}</span></div>
              <div>Schemas: <span style={{ color: 'var(--text-muted)' }}>Ready for Phase 1 Seeding</span></div>
            </div>
          </div>
        </div>

        {/* Phase 0 Deliverables & Ready Check */}
        <div className="glass-panel" style={{ padding: '1.75rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={22} color="#10b981" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                Phase 0 Milestone Status: 100% Complete (5% Overall Progress)
              </h3>
            </div>
            <span className="badge badge-live">
              READY FOR PHASE 1
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={16} /> Repository Structure
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Clean multi-tier layout configured with <code>frontend/</code>, <code>backend/</code>, <code>ai-service/</code>, <code>data/</code>, and <code>docs/</code>.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={16} /> Pilgrimage Zones & Resources Plan
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Defined 6 crowd zones (Gate 1, 2, 3, Temple, Main Rd, Parking), 6 water/food stations, 4 sanitation spots, and 16 volunteers in <code>docs/zones_and_resources_plan.md</code>.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} /> Tri-Service Connectivity
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                React Dashboard, Express Backend + Socket.IO, and FastAPI AI Inference servers verified running and communicating.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
