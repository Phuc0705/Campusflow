import { useState, useEffect } from 'react';
import { Users, Activity, QrCode, Zap, Bell } from 'lucide-react';
import WellnessChart from '../components/WellnessChart';
import EventsList from '../components/EventsList';
import Leaderboard from '../components/Leaderboard';
import RelaxSuggestionsPopup from '../components/RelaxSuggestionsPopup';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 1250,
    activeSessions: 450,
    qrCheckins: 0,
    aiOptimizations: 85,
  });

  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [wellness, setWellness] = useState<any | null>(null);
  const [showRelaxPopup, setShowRelaxPopup] = useState(false);
  const [showBurnoutAlert, setShowBurnoutAlert] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/events');
        const data = await res.json();
        if (data.success) {
          setRecentEvents(data.data);
          setStats(prev => ({ ...prev, qrCheckins: data.checkInCount }));
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu Admin:', error);
      }

      try {
        const w = await fetch('http://localhost:3000/api/wellness');
        const wd = await w.json();
        if (wd.success) {
          setWellness(wd.data);
          const totalHours = (wd.data.study_hours || 0) + (wd.data.work_hours || 0);
          setShowBurnoutAlert(totalHours > 60);
        }
      } catch (e) {
        console.error('Lỗi khi lấy wellness:', e);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container" style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>Bảng điều khiển Nhà trường (Real-time)</h1>
      
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-icon bg-blue"><Users size={20} /></div>
          <div className="stat-details"><h3>Tổng Sinh viên</h3><div className="stat-value">{stats.totalStudents}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green"><Activity size={20} /></div>
          <div className="stat-details"><h3>Đang Online</h3><div className="stat-value">{stats.activeSessions}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple"><QrCode size={20} /></div>
          <div className="stat-details"><h3>QR Điểm danh (API)</h3><div className="stat-value">{stats.qrCheckins}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-red"><Zap size={20} /></div>
          <div className="stat-details"><h3>AI Tối ưu hóa</h3><div className="stat-value">{stats.aiOptimizations}</div></div>
        </div>
      </div>

      {showBurnoutAlert && wellness && (
        <div className="chart-card" style={{ backgroundColor: '#fff4f4', border: '1px solid #fecaca' }}>
          <div className="card-header"><h3>⚠️ Cảnh báo Burnout</h3></div>
          <p>{`Tổng giờ học + làm của sinh viên mẫu: ${wellness.study_hours + wellness.work_hours} giờ/tuần — vượt ngưỡng 60 giờ.`}</p>
          <button onClick={() => setShowRelaxPopup(true)} style={{ marginTop: 12 }} className="nav-item">Gợi ý hoạt động thư giãn</button>
        </div>
      )}

      <div className="charts-container">
        <div className="chart-card">
          <div className="card-header"><h3>Wellness: Giờ học / Làm / Ngủ</h3></div>
          <div className="chart-wrapper">
            <WellnessChart data={wellness} />
          </div>
        </div>

        <div className="chart-card">
          <div className="card-header"><h3>Leaderboard: Pomodoro Points</h3></div>
          <Leaderboard />
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <EventsList />
      </div>

      <RelaxSuggestionsPopup open={showRelaxPopup} onClose={() => setShowRelaxPopup(false)} />
    </div>
  );
}
