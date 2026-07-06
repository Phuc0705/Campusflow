const express = require('express');
const router = express.Router();
const axios = require('axios');
const authenticateUser = require('../middleware/auth');

// Sử dụng middleware xác thực
router.use(authenticateUser);

// Lấy danh sách lịch học từ Supabase
router.get('/', async (req, res) => {
  try {
    const { data: schedules, error } = await req.userClient
      .from('schedules')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: schedules || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Thêm một lịch học/sự kiện mới
router.post('/', async (req, res) => {
  try {
    const { course_code, course_name, room, start_time, end_time, type } = req.body;
    
    const newSchedule = {
      user_id: req.user.id,
      course_code,
      course_name,
      room,
      start_time,
      end_time,
      type: type || 'LECTURE'
    };

    const { data, error } = await req.userClient
      .from('schedules')
      .insert([newSchedule])
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Thêm Endpoint kết nối với AI (Python)
router.post('/optimize', async (req, res) => {
  try {
    const { events } = req.body;
    
    // 1. Gửi request sang Python AI Service (cổng 8000) bằng axios
    const aiResponse = await axios.post('http://127.0.0.1:8000/api/optimize/check-conflict', {
      events, duration_minutes: 60
    });
    const conflictData = aiResponse.data;

    const suggestResponse = await axios.post('http://127.0.0.1:8000/api/optimize/suggest-slots', {
      events, duration_minutes: 60
    });
    const suggestData = suggestResponse.data;

    // 2. Gộp kết quả và trả về cho Mobile
    res.json({ 
      success: true, 
      conflicts: conflictData.conflicts || [],
      suggested_slots: suggestData.suggested_slots || []
    });

  } catch (error) {
    console.error('Lỗi khi gọi AI Service:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Không thể kết nối đến AI Service. Đảm bảo Python đang chạy ở cổng 8000.' 
    });
  }
});

module.exports = router;
