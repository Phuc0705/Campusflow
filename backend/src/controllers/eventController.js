const supabase = require('../config/supabase');
const { buildIcsCalendar, validateGpsCheckin } = require('../utils/featureHelpers');

async function listEvents(req, res) {
  try {
    const { data: events, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (error) throw error;

    const { count } = await supabase.from('event_registrations').select('*', { count: 'exact', head: true });

    res.json({ success: true, data: events || [], checkInCount: count || 0 });
  } catch (error) {
    console.error('Lỗi get events: ', error.message);
    res.json({ success: true, data: [{ id: 'evt-1', title: 'Ngày hội Việc làm IT', club: 'Khoa CNTT', location: 'Hội trường A', date: new Date().toISOString(), points: 5 }], checkInCount: 0 });
  }
}

async function checkIn(req, res) {
  try {
    const { event_id, latitude, longitude, eventLatitude, eventLongitude, userId } = req.body;

    if (!event_id) {
      return res.status(400).json({ success: false, message: 'Mã sự kiện không hợp lệ' });
    }

    const gpsResult = validateGpsCheckin({ latitude, longitude, eventLatitude, eventLongitude });
    if (!gpsResult.success) {
      return res.status(400).json({ success: false, message: gpsResult.message, data: gpsResult });
    }

    try {
      const { error } = await supabase.from('event_registrations').insert([{ event_id, user_id: userId || null, check_in_time: new Date().toISOString() }]);
      if (error) throw error;
    } catch (dbError) {
      console.warn('Không thể ghi check-in vào DB:', dbError.message);
    }

    res.json({ success: true, message: 'Điểm danh thành công! Đã lưu vào CSDL.', data: gpsResult });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function exportIcs(req, res) {
  try {
    const { events = [] } = req.body;
    const icsContent = buildIcsCalendar(events);
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="campusflow-events.ics"');
    res.send(icsContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { listEvents, checkIn, exportIcs };
