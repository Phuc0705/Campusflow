import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Calendar, MapPin, Clock } from 'lucide-react';

export default function EventsList() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchEvents = async () => {
    setLoading(true);
    // Kéo dữ liệu từ bảng events
    let query = supabase.from('events').select('*').order('start_time', { ascending: true });
    
    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;
    if (data && !error) {
      setEvents(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-700">Sự kiện & CLB sắp tới</h3>
        <div className="flex gap-4 items-center">
          <select 
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tất cả sự kiện</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="PENDING">Chờ duyệt</option>
          </select>
          <button onClick={fetchEvents} className="text-sm text-blue-600 hover:underline">
            Làm mới
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm italic">Đang tải sự kiện...</div>
      ) : events.length === 0 ? (
        <div className="text-gray-500 text-sm">Không có sự kiện nào.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((evt) => (
            <div key={evt.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  evt.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {evt.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                </span>
              </div>
              <h4 className="font-bold text-gray-800 mb-1 truncate" title={evt.title}>{evt.title}</h4>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{evt.description}</p>
              
              <div className="flex flex-col gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar size={14} /> <span>{new Date(evt.start_time).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} /> <span>{evt.location || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} /> <span>{evt.organizer || 'Ban tổ chức'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}