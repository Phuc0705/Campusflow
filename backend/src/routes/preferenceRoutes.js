const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/auth');

router.use(authenticateUser);

// Lấy cấu hình khung giờ sinh hoạt của user
router.get('/', async (req, res) => {
  try {
    const { data, error } = await req.userClient
      .from('user_preferences')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    // Nếu chưa có, trả về data mặc định thay vì báo lỗi
    if (error && error.code === 'PGRST116') { // PGRST116 là mã lỗi không tìm thấy dòng nào (No rows found)
      return res.json({ 
        success: true, 
        data: {
          sleep_start_time: '23:00',
          sleep_end_time: '06:00',
          lunch_start_time: '12:00',
          lunch_end_time: '13:00',
          commute_duration_minutes: 30
        }
      });
    }

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error("Lỗi get preferences: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Lưu/Cập nhật cấu hình khung giờ sinh hoạt (Upsert)
router.post('/', async (req, res) => {
  try {
    const { 
      sleep_start_time, 
      sleep_end_time, 
      lunch_start_time, 
      lunch_end_time, 
      commute_duration_minutes 
    } = req.body;

    const preferenceData = {
      user_id: req.user.id,
      sleep_start_time: sleep_start_time || '23:00',
      sleep_end_time: sleep_end_time || '06:00',
      lunch_start_time: lunch_start_time || '12:00',
      lunch_end_time: lunch_end_time || '13:00',
      commute_duration_minutes: commute_duration_minutes || 30,
      updated_at: new Date().toISOString()
    };

    // Upsert (Insert nếu chưa có, Update nếu đã có theo primary key)
    const { data, error } = await req.userClient
      .from('user_preferences')
      .upsert(preferenceData)
      .select();

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Cập nhật cấu hình thành công',
      data: data[0]
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
