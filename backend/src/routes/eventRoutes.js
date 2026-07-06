const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Lấy danh sách sự kiện Campus Life
router.get('/', async (req, res) => {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Lấy số lượng người đã điểm danh (để hiển thị lên web admin)
    const { count } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true });

    res.json({ success: true, data: events || [], checkInCount: count || 0 });
  } catch (error) {
    console.error("Lỗi get events: ", error.message);
    // Trả về mock data nếu db chưa có table
    res.json({ success: true, data: [
      { 
        id: 'evt-1', 
        title: 'Ngày hội Việc làm IT', 
        club: 'Khoa CNTT', 
        location: 'Hội trường A',
        date: new Date().toISOString(),
        points: 5
      }
    ], checkInCount: 0 });
  }
});

// Quét mã QR điểm danh (từ Mobile)
router.post('/checkin', async (req, res) => {
  try {
    const { event_id } = req.body;
    
    if (!event_id) {
      return res.status(400).json({ success: false, message: 'Mã sự kiện không hợp lệ' });
    }

    // Insert điểm danh vào db
    const { error } = await supabase
      .from('event_registrations')
      .insert([{ event_id }]);

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Điểm danh thành công! Đã lưu vào CSDL.'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
