import React, { useEffect, useState } from 'react';

export default function AdminEventsReview() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => { fetchEvents(); }, []);

  async function fetchEvents() {
    try {
      const res = await fetch('http://localhost:3000/api/events');
      const data = await res.json();
      if (data.success) setEvents(data.data || []);
    } catch (e) { console.error(e); }
  }

  function approve(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id));
    alert('Approved (mock) ' + id);
  }
  function reject(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id));
    alert('Rejected (mock) ' + id);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Duyệt Sự kiện & CLB</h2>
      <div style={{ marginTop: 12 }}>
        {events.map(ev => (
          <div key={ev.id} style={{ background: 'white', padding: 12, marginBottom: 8, borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{ev.title}</div>
                <div style={{ fontSize: 13, color: '#666' }}>{ev.club} • {ev.location}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => approve(ev.id)} style={{ background: '#10b981', color: 'white', padding: '6px 10px', borderRadius: 6 }}>Duyệt</button>
                <button onClick={() => reject(ev.id)} style={{ background: '#ef4444', color: 'white', padding: '6px 10px', borderRadius: 6 }}>Từ chối</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
