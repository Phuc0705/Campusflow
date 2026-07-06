const express = require('express');
const router = express.Router();

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
  // Trong thực tế sẽ gọi Firebase Admin SDK để push xuống token điện thoại
  console.log(`[Push Notification Triggered]: ${message}`);
  res.json({ success: true, message: 'Đã gửi lệnh đẩy thông báo' });
});
// [CF-33] API cấu hình phương thức nhận thông báo
router.post('/config', async (req, res) => {
  try {
    const userId = req.headers['x-user-id']; 
    const { email_enabled, app_enabled, telegram_enabled, telegram_chat_id } = req.body;

    // Cho phép test không cần user_id
    if (!userId) {
      return res.json({ success: true, message: 'Đã nhận config (bỏ qua RLS vì không có user_id)' });
    }

    const supabase = require('../config/supabase');
    const { data, error } = await supabase
      .from('notification_configs')
      .upsert({ 
        user_id: userId, 
        email_enabled: email_enabled !== undefined ? email_enabled : true,
        app_enabled: app_enabled !== undefined ? app_enabled : true,
        telegram_enabled: telegram_enabled || false,
        telegram_chat_id: telegram_chat_id || null,
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) throw error;
    res.json({ success: true, message: 'Cập nhật cấu hình thông báo thành công', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
