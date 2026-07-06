import React from 'react';
import { X, Headphones, Wind, Coffee } from 'lucide-react';

type Props = { open: boolean; onClose: () => void };

export default function RelaxSuggestionsPopup({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-red-50">
          <h3 className="font-bold text-red-700">Đã đến lúc nghỉ ngơi!</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        
        <div className="p-5 flex flex-col gap-4">
          <p className="text-gray-600 text-sm mb-2">Hệ thống nhận thấy bạn đang làm việc cường độ cao. Hãy thử các hoạt động sau để giảm căng thẳng:</p>
          
          <button className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition text-left">
            <Wind size={20} /> <div><div className="font-semibold">Bài tập hít thở 2 phút</div><div className="text-xs opacity-80">Box breathing technique</div></div>
          </button>
          
          <button className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition text-left">
            <Headphones size={20} /> <div><div className="font-semibold">Nghe Lo-fi / Nhạc thiền</div><div className="text-xs opacity-80">Playlist tập trung & thư giãn</div></div>
          </button>

          <button className="w-full flex items-center gap-3 p-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition text-left">
            <Coffee size={20} /> <div><div className="font-semibold">Đứng dậy và đi dạo</div><div className="text-xs opacity-80">Rời mắt khỏi màn hình 5 phút</div></div>
          </button>
        </div>
      </div>
    </div>
  );
}
