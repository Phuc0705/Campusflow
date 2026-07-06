const express = require('express');
const router = express.Router();
const { parseDeadline, sendWeeklyReport } = require('../controllers/notificationController');

// Mock API lấy danh sách thông báo
router.get('/', async (req, res) => {
  try {
    const mockNotifications = [
      {
        id: 'notif-1',
        title: '🔥 Hạn nộp sát nút!',
        message: 'Bạn có deadline môn Quản lý dự án phần mềm vào lúc 23:59 hôm nay.',
        type: 'DEADLINE_ALERT',
        read: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'notif-2',
        title: '⏰ Sắp đến giờ học',
        message: 'Lớp Xác suất thống kê (TC-301) sẽ bắt đầu sau 15 phút nữa.',
        type: 'CLASS_REMINDER',
        read: true,
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ];

    res.json({ success: true, data: mockNotifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API giả lập gửi Push Notification từ webhook hệ thống
router.post('/trigger-push', async (req, res) => {
  const { message } = req.body;
  console.log(`[Push Notification Triggered]: ${message}`);
  res.json({ success: true, message: 'Đã gửi lệnh đẩy thông báo' });
});

router.post('/deadlines/parse', parseDeadline);
router.post('/reports/weekly-email', sendWeeklyReport);

module.exports = router;
