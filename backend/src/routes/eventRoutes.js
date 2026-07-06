const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/auth');
const supabase = require('../config/supabase'); // Admin client fallback if needed

// Mọi request vào Events (Đăng ký) đều cần Auth. Tuy nhiên, xem danh sách thì có thể Auth hoặc không.
// Để đơn giản và bảo mật, ta yêu cầu Auth cho mọi request.
router.use(authenticateUser);

// Lấy danh sách sự kiện Campus Life và trạng thái đăng ký của user hiện tại
router.get('/', async (req, res) => {
  try {
    const { data: events, error } = await req.userClient
      .from('events')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) throw error;

    // Lấy danh sách các sự kiện mà user hiện tại đã đăng ký
    const { data: registrations, error: regError } = await req.userClient
      .from('event_registrations')
      .select('event_id')
      .eq('user_id', req.user.id);
      
    if (regError) throw regError;
    
    const registeredEventIds = registrations.map(r => r.event_id);

    // Map lại data để Mobile dễ bề hiển thị
    const formattedEvents = (events || []).map(event => ({
      ...event,
      is_registered: registeredEventIds.includes(event.id)
    }));

    res.json({ success: true, data: formattedEvents });
  } catch (error) {
    console.error("Lỗi get events: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Nút bấm "Đăng ký tham gia"
router.post('/register', async (req, res) => {
  try {
    const { event_id } = req.body;
    
    if (!event_id) {
      return res.status(400).json({ success: false, message: 'Mã sự kiện không hợp lệ' });
    }

    // 1. Lấy thông tin chi tiết sự kiện
    const { data: eventData, error: eventError } = await req.userClient
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (eventError || !eventData) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện' });
    }

    // 2. Insert vào bảng danh sách đăng ký
    const { error: regError } = await req.userClient
      .from('event_registrations')
      .insert([{ event_id, user_id: req.user.id }]);

    if (regError) {
      // Nếu lỗi do trùng lặp (đã đăng ký rồi)
      if (regError.code === '23505') {
        return res.status(400).json({ success: false, message: 'Bạn đã đăng ký sự kiện này rồi!' });
      }
      throw regError;
    }

    // 3. TỰ ĐỘNG CHÈN VÀO THỜI KHÓA BIỂU
    const newSchedule = {
      user_id: req.user.id,
      course_code: 'EVENT',
      course_name: eventData.title,
      room: eventData.location,
      start_time: eventData.start_time,
      end_time: eventData.end_time,
      type: 'EVENT'
    };

    const { error: schError } = await req.userClient
      .from('schedules')
      .insert([newSchedule]);

    if (schError) throw schError;

    res.json({ 
      success: true, 
      message: 'Đăng ký thành công! Đã tự động thêm vào Thời khóa biểu.'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
