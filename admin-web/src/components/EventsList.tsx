import React, { useEffect, useState } from 'react';

export default function EventsList() {
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await fetch('http://localhost:3000/api/events');
      const data = await res.json();
      if (data.success) setEvents(data.data || []);
    } catch (e) {
      console.error(e);
    }
  }

  const clubs = Array.from(new Set(events.map((e) => e.club || 'Other')));

  const filtered = events.filter((e) => (filter === 'ALL' ? true : (e.club || 'Other') === filter));

  return (
    <div className="chart-card">
      <div className="card-header"><h3>Sự kiện & CLB</h3></div>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="ALL">Tất cả</option>
          {clubs.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={fetchEvents} style={{ marginLeft: 'auto' }}>Làm mới</button>
      </div>

      <div>
        {filtered.map((ev) => (
          <div key={ev.id} style={{ padding: 12, borderBottom: '1px solid #f1f1f1' }}>
            <div style={{ fontWeight: 700 }}>{ev.title}</div>
            <div style={{ fontSize: 13, color: '#666' }}>{ev.club} • {ev.location}</div>
            <div style={{ fontSize: 13, color: '#999' }}>{new Date(ev.date).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
