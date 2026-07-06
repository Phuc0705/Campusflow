const express = require('express');
const router = express.Router();
const axios = require('axios'); // Thêm axios cho CF-16
const { google } = require('googleapis'); // Thêm googleapis cho CF-03

// Lấy danh sách lịch học (Mock data cho Sprint 1)
router.get('/', async (req, res) => {
  try {
    const today = new Date();
    const mockSchedules = [
      {
        id: 'sch-1',
        course_code: 'IT3140',
        title: 'Quản lý dự án phần mềm',
        room: 'D3-501',
        start_time: new Date(today.setHours(8, 0, 0, 0)).toISOString(),
        end_time: new Date(today.setHours(10, 15, 0, 0)).toISOString(),
        type: 'LECTURE'
      },
      {
        id: 'sch-2',
        course_code: 'IT3140',
        title: 'Làm bù bài tập nhóm (Tự học)',
        room: 'Thư viện',
        start_time: new Date(today.setHours(9, 30, 0, 0)).toISOString(),
        end_time: new Date(today.setHours(11, 0, 0, 0)).toISOString(),
        type: 'SELF_STUDY'
      },
      {
        id: 'sch-3',
        course_code: 'CLUB',
        title: 'Sinh hoạt CLB IT',
        room: 'Sân C2',
        start_time: new Date(today.setHours(16, 0, 0, 0)).toISOString(),
        end_time: new Date(today.setHours(18, 0, 0, 0)).toISOString(),
        type: 'EXTRACURRICULAR'
      }
    ];

    res.json({ success: true, data: mockSchedules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// [CF-16] Endpoint kết nối với AI (Python) kiểm tra trùng lịch
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

// [CF-03] Endpoint Đồng bộ sự kiện từ Google Calendar
router.get('/sync-from-google', async (req, res) => {
    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        // TODO: Bổ sung logic truyền token thật và gọi calendar.events.list

        res.json({ 
            success: true, 
            message: 'Đã kết nối thành công endpoint đồng bộ Google Calendar!', 
            data: [] 
        });
    } catch (error) {
        console.error('Lỗi khi đồng bộ Google Calendar:', error);
        res.status(500).json({ success: false, error: 'Lỗi server' });
    }
});

module.exports = router;