import React from 'react';

type Props = { open: boolean; onClose: () => void };

export default function RelaxSuggestionsPopup({ open, onClose }: Props) {
  if (!open) return null;

  const suggestions = [
    { title: 'Thiền 5 phút', desc: 'Hít thở sâu, tắt màn hình, tập trung nhịp thở.' },
    { title: 'Bài tập kéo giãn', desc: 'Giãn cơ cổ, vai trong 3 phút.' },
    { title: 'Nghe audio nhẹ', desc: 'Playlist 10 phút giảm stress.' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
      <div style={{ background: 'white', padding: 20, borderRadius: 12, width: 420 }}>
        <h3>Gợi ý hoạt động thư giãn</h3>
        <div style={{ marginTop: 12 }}>
          {suggestions.map((s) => (
            <div key={s.title} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
              <strong>{s.title}</strong>
              <div style={{ fontSize: 13, color: '#555' }}>{s.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={onClose} style={{ padding: '8px 12px' }}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
