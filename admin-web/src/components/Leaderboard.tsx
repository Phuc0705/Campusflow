import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Đảm bảo bạn đã có file client này

export default function Leaderboard() {
  const [topUsers, setTopUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // Kéo top 4 sinh viên có điểm Pomodoro cao nhất từ Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, pomodoro_points')
        .order('pomodoro_points', { ascending: false })
        .limit(4);

      if (data && !error) {
        setTopUsers(data);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankColor = (index: number) => {
    const colors = ['bg-yellow-400', 'bg-gray-300', 'bg-orange-400', 'bg-blue-100'];
    return colors[index] || 'bg-gray-100';
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Pomodoro Points</h3>
      <div className="flex flex-col gap-3">
        {topUsers.length === 0 ? (
          <div className="text-gray-400 text-sm italic">Đang tải dữ liệu...</div>
        ) : (
          topUsers.map((user, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold shadow-sm ${getRankColor(index)}`}>
                  {index + 1}
                </div>
                {/* Lấy full_name từ Database */}
                <span className="font-medium text-gray-700">{user.full_name || 'Người dùng ẩn danh'}</span>
              </div>
              {/* Lấy pomodoro_points từ Database */}
              <span className="font-bold text-blue-600">{user.pomodoro_points || 0} pt</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
