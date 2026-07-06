import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AdminEventsReview() {
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Kéo danh sách các sự kiện đang chờ duyệt (PENDING)
  const fetchPendingEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'PENDING')
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Lỗi tải danh sách sự kiện:', error.message);
    } else if (data) {
      setPendingEvents(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  // 2. Hàm xử lý Duyệt / Từ chối sự kiện
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('events')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert('Có lỗi xảy ra khi cập nhật trạng thái!');
      console.error(error);
    } else {
      // Xóa sự kiện khỏi danh sách chờ duyệt trên UI ngay lập tức
      setPendingEvents(prev => prev.filter(event => event.id !== id));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Duyệt Sự kiện & CLB</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải danh sách...</div>
        ) : pendingEvents.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
            <CheckCircle size={32} className="text-green-500 mb-2" />
            <p>Tuyệt vời! Không còn sự kiện nào cần duyệt.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                  <th className="p-4 font-semibold">Tên sự kiện</th>
                  <th className="p-4 font-semibold">Ban tổ chức</th>
                  <th className="p-4 font-semibold">Thời gian & Địa điểm</th>
                  <th className="p-4 font-semibold">Trạng thái</th>
                  <th className="p-4 font-semibold text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{evt.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-1 w-48" title={evt.description}>
                        {evt.description}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-700">{evt.organizer || 'N/A'}</td>
                    <td className="p-4 text-sm text-gray-600">
                      <div>{new Date(evt.start_time).toLocaleDateString('vi-VN')}</div>
                      <div className="text-xs text-gray-400">{evt.location}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        <Clock size={12} /> Chờ duyệt
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleUpdateStatus(evt.id, 'APPROVED')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Duyệt sự kiện"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(evt.id, 'REJECTED')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Từ chối sự kiện"
                      >
                        <XCircle size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
