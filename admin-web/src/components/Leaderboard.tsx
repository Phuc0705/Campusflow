import React from 'react';

export default function Leaderboard() {
  const data = [
    { name: 'Nguyễn Văn A', points: 320 },
    { name: 'Trần Thị B', points: 290 },
    { name: 'Lê Văn C', points: 250 },
  ];

  return (
    <div style={{ padding: 12 }}>
      <ol style={{ marginLeft: 12 }}>
        {data.map((p, i) => (
          <li key={p.name} style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
            <div>{i+1}. {p.name}</div>
            <div style={{ fontWeight: 700 }}>{p.points}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
