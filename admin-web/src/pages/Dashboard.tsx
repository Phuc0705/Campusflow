import { useState, useEffect } from 'react';
import { Users, Activity, QrCode, Zap } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 1250,
    activeSessions: 450,
    qrCheckins: 0,
    aiOptimizations: 85,
  });

  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  useEffect(() => {
    // Gọi API lấy dữ liệu thực tế từ Backend
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
    };

    fetchDashboardData();
    // Refresh mỗi 5 giây để xem check-in real-time
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container" style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>Bảng điều khiển Nhà trường (Real-time)</h1>
      
      {/* Thống kê chung */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div className="stat-card" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}><Users size={24} color="#3b82f6" /><h3 style={{ marginLeft: '10px', color: '#6b7280' }}>Tổng Sinh viên</h3></div>
          <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.totalStudents}</p>
        </div>
        <div className="stat-card" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}><Activity size={24} color="#10b981" /><h3 style={{ marginLeft: '10px', color: '#6b7280' }}>Đang Online</h3></div>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>{stats.activeSessions}</p>
        </div>
        <div className="stat-card" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #8b5cf6' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}><QrCode size={24} color="#8b5cf6" /><h3 style={{ marginLeft: '10px', color: '#6b7280', fontWeight: 'bold' }}>QR Điểm danh (API)</h3></div>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.qrCheckins}</p>
        </div>
        <div className="stat-card" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}><Zap size={24} color="#f59e0b" /><h3 style={{ marginLeft: '10px', color: '#6b7280' }}>AI Tối ưu hóa</h3></div>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.aiOptimizations}</p>
        </div>
      </div>

      {/* Sự kiện Campus Life */}
      <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Sự kiện Campus Life (Kết nối Backend)</h2>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
              <th style={{ padding: '10px' }}>Tên sự kiện</th>
              <th style={{ padding: '10px' }}>Đơn vị tổ chức</th>
              <th style={{ padding: '10px' }}>Địa điểm</th>
              <th style={{ padding: '10px' }}>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {recentEvents.map((event) => (
              <tr key={event.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '15px 10px', fontWeight: 'bold' }}>{event.title}</td>
                <td style={{ padding: '15px 10px', color: '#4b5563' }}>{event.club}</td>
                <td style={{ padding: '15px 10px', color: '#4b5563' }}>{event.location}</td>
                <td style={{ padding: '15px 10px', color: '#6b7280' }}>{new Date(event.date).toLocaleString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
