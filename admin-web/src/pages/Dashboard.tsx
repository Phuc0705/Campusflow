import { useState, useEffect } from 'react';
import { Users, Activity, QrCode, Zap } from 'lucide-react';
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

  const [wellness, setWellness] = useState<any | null>(null);
  const [showRelaxPopup, setShowRelaxPopup] = useState(false);
  const [showBurnoutAlert, setShowBurnoutAlert] = useState(false);

  useEffect(() => {
    // Tạm thời dùng mock data để bạn test UI trước khi nối API
    const mockWellness = { study_hours: 35, work_hours: 30, sleep_hours_avg: 5 };
    setWellness(mockWellness);
    
    const totalHours = mockWellness.study_hours + mockWellness.work_hours;
    setShowBurnoutAlert(totalHours > 60);
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Bảng điều khiển Nhà trường (Real-time)</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Users size={24} /></div>
          <div><h3 className="text-sm text-gray-500">Tổng Sinh viên</h3><div className="text-xl font-bold">{stats.totalStudents}</div></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Activity size={24} /></div>
          <div><h3 className="text-sm text-gray-500">Đang Online</h3><div className="text-xl font-bold">{stats.activeSessions}</div></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><QrCode size={24} /></div>
          <div><h3 className="text-sm text-gray-500">QR Điểm danh</h3><div className="text-xl font-bold">{stats.qrCheckins}</div></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg"><Zap size={24} /></div>
          <div><h3 className="text-sm text-gray-500">AI Tối ưu hóa</h3><div className="text-xl font-bold">{stats.aiOptimizations}</div></div>
        </div>
      </div>

      {/* Burnout Alert (CF-22) */}
      {showBurnoutAlert && wellness && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6 flex flex-col items-start gap-2 shadow-sm">
          <h3 className="font-bold text-red-700 flex items-center gap-2">⚠️ Cảnh báo Burnout</h3>
          <p className="text-red-600 text-sm">{`Tổng giờ học + làm của sinh viên mẫu: ${wellness.study_hours + wellness.work_hours} giờ/tuần — vượt ngưỡng an toàn (60 giờ).`}</p>
          <button 
            onClick={() => setShowRelaxPopup(true)} 
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Gợi ý hoạt động thư giãn
          </button>
        </div>
      )}

      {/* Charts & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Wellness: Giờ học / Làm / Ngủ</h3>
          <div className="h-64 flex items-center justify-center">
            <WellnessChart data={wellness} />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <Leaderboard />
        </div>
      </div>

      <EventsList />
      <RelaxSuggestionsPopup open={showRelaxPopup} onClose={() => setShowRelaxPopup(false)} />
    </div>
  );
}