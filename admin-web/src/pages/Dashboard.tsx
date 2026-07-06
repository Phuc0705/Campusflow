import { useState, useEffect } from 'react';
import { Users, Activity, QrCode, Zap, CalendarClock, Sparkles, ShieldCheck, Send } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 1250,
    activeSessions: 450,
    qrCheckins: 0,
    aiOptimizations: 85,
  });

  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [featureStatus, setFeatureStatus] = useState<any[]>([]);
  const [deadlineMessage, setDeadlineMessage] = useState('Zalo: Deadline môn PM nộp báo cáo trước 20h tối nay');
  const [parsedDeadline, setParsedDeadline] = useState<any>(null);
  const [calendarEvents, setCalendarEvents] = useState('Họp nhóm|2026-07-07T19:00:00|2026-07-07T20:00:00\nLàm bài|2026-07-07T20:30:00|2026-07-07T21:30:00');
  const [calendarExport, setCalendarExport] = useState('');
  const [groupInput, setGroupInput] = useState('Bạn A|2026-07-07T09:00:00|2026-07-07T11:00:00\nBạn B|2026-07-07T10:00:00|2026-07-07T12:00:00');
  const [groupResult, setGroupResult] = useState<any[]>([]);
  const [emailStatus, setEmailStatus] = useState('');

  const handleParseDeadline = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/notifications/deadlines/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: deadlineMessage, userId: 'demo-user' }),
      });
      const data = await res.json();
      setParsedDeadline(data.data);
    } catch (error) {
      console.error('Lỗi khi parse deadline:', error);
    }
  };

  const handleExportCalendar = async () => {
    try {
      const events = calendarEvents
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [title, start, end] = line.split('|');
          return { title, start, end, description: 'Imported from admin panel' };
        });

      const res = await fetch('http://localhost:3000/api/events/export-ics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });
      const text = await res.text();
      const blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'campusflow-events.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setCalendarExport(text);
    } catch (error) {
      console.error('Lỗi khi xuất ICS:', error);
    }
  };

  const handleGroupFreeTime = async () => {
    try {
      const members = groupInput
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [, start, end] = line.split('|');
          return [{ start, end }];
        });

      const res = await fetch('http://localhost:3000/api/schedules/group-free-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members, dayStart: '2026-07-07T08:00:00.000Z', dayEnd: '2026-07-07T22:00:00.000Z', durationMinutes: 60 }),
      });
      const data = await res.json();
      setGroupResult(data.data || []);
    } catch (error) {
      console.error('Lỗi khi tính khung giờ chung:', error);
    }
  };

  const handleSendWeeklyReport = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/notifications/reports/weekly-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setEmailStatus(data.message || 'Báo cáo đã được chuẩn bị');
    } catch (error) {
      console.error('Lỗi khi gửi email báo cáo:', error);
      setEmailStatus('Không thể gửi email ngay lúc này');
    }
  };

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
    };

    const fetchFeatureStatus = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/features/health');
        const data = await res.json();
        if (data.success) {
          setFeatureStatus([
            { title: '.ICS Calendar Export', description: 'Xuất lịch tương thích Apple/Outlook', icon: CalendarClock },
            { title: 'NLP Deadline Parser', description: 'Bóc tách tin nhắn Zalo/Telegram thành deadline', icon: Sparkles },
            { title: 'QR + GPS Check-in', description: 'Điểm danh thông minh với định vị', icon: ShieldCheck },
          ]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy trạng thái tính năng:', error);
      }
    };

    fetchDashboardData();
    fetchFeatureStatus();
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {featureStatus.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} style={{ padding: '20px', background: 'linear-gradient(135deg, #f8fbff 0%, #eef6ff 100%)', borderRadius: '14px', border: '1px solid #dbeafe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Icon size={18} />
                </div>
                <h3 style={{ fontWeight: '700' }}>{feature.title}</h3>
              </div>
              <p style={{ color: '#475569', lineHeight: 1.5 }}>{feature.description}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gap: '20px', marginBottom: '24px' }}>
        <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>🧠 NLP Deadline Parser</h2>
          <textarea value={deadlineMessage} onChange={(e) => setDeadlineMessage(e.target.value)} style={{ width: '100%', minHeight: '90px', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '10px' }} />
          <button onClick={handleParseDeadline} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer' }}><Send size={14} style={{ marginRight: '6px' }} />Phân tích</button>
          {parsedDeadline && <pre style={{ marginTop: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', overflowX: 'auto' }}>{JSON.stringify(parsedDeadline, null, 2)}</pre>}
        </div>

        <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>📅 Export .ics cho Apple/Outlook</h2>
          <textarea value={calendarEvents} onChange={(e) => setCalendarEvents(e.target.value)} placeholder={'Tên sự kiện|2026-07-07T19:00:00|2026-07-07T20:00:00'} style={{ width: '100%', minHeight: '110px', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '10px' }} />
          <button onClick={handleExportCalendar} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer' }}>Xuất file .ics</button>
          {calendarExport && <pre style={{ marginTop: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', overflowX: 'auto' }}>{calendarExport}</pre>}
        </div>

        <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>👥 Tìm khung giờ rảnh chung</h2>
          <textarea value={groupInput} onChange={(e) => setGroupInput(e.target.value)} placeholder={'Tên bạn|2026-07-07T09:00:00|2026-07-07T11:00:00'} style={{ width: '100%', minHeight: '110px', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '10px' }} />
          <button onClick={handleGroupFreeTime} style={{ backgroundColor: '#8b5cf6', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer' }}>Tìm khung chung</button>
          {groupResult.length > 0 && <pre style={{ marginTop: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', overflowX: 'auto' }}>{JSON.stringify(groupResult, null, 2)}</pre>}
        </div>

        <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>📧 Báo cáo tổng kết tuần</h2>
          <button onClick={handleSendWeeklyReport} style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer' }}>Gửi báo cáo</button>
          {emailStatus && <p style={{ marginTop: '12px', color: '#475569' }}>{emailStatus}</p>}
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
