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

// Thêm Endpoint kết nối với AI (Hiện tại xử lý bằng Node.js trực tiếp để tiện demo)
router.post('/optimize', async (req, res) => {
  try {
    const { events } = req.body;
    
    // AI Mock Logic: Tìm xung đột (trùng lịch)
    const conflicts = [];
    if (events && events.length > 1) {
      for (let i = 0; i < events.length; i++) {
        for (let j = i + 1; j < events.length; j++) {
          const start1 = new Date(events[i].start_time).getTime();
          const end1 = new Date(events[i].end_time).getTime();
          const start2 = new Date(events[j].start_time).getTime();
          const end2 = new Date(events[j].end_time).getTime();
          
          // Kiểm tra giao nhau
          if (start1 < end2 && start2 < end1) {
            conflicts.push({
              event_1: events[i],
              event_2: events[j],
              message: `Trùng lịch giữa ${events[i].course_code} và ${events[j].course_code}`
            });
          }
        }
      }
    }

    // AI Mock Logic: Gợi ý giờ tự học (Chỉ gợi ý nếu rảnh vào buổi chiều)
    const suggested_slots = [];
    if (events && events.length > 0) {
      const today = new Date();
      today.setHours(14, 0, 0, 0); // Đề xuất lúc 14h
      
      const isBusyAt14h = events.some(e => {
        const s = new Date(e.start_time).getTime();
        const end = new Date(e.end_time).getTime();
        const suggestTime = today.getTime();
        return suggestTime >= s && suggestTime < end;
      });

      if (!isBusyAt14h) {
        suggested_slots.push({
          start: today.toISOString(),
          message: 'Khung giờ chiều từ 14:00 rất tốt để tự học và làm bài tập (AI Đề xuất dựa trên nhịp sinh học).'
        });
      }
    }

    // 2. Gộp kết quả và trả về cho Mobile
    res.json({ 
      success: true, 
      conflicts,
      suggested_slots
    });

  } catch (error) {
    console.error('Lỗi khi gọi AI Service:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Không thể xử lý dữ liệu AI.' 
    });
  }
});

module.exports = router;
