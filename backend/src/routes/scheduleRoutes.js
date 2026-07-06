const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const pdf = require('pdf-parse');
const xlsx = require('xlsx');
const supabase = require('../config/supabase');

// Setup multer (lưu tạm file trên RAM)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Lấy danh sách lịch học (Mock data cho Sprint 1)
router.get('/', async (req, res) => {
  // Lấy danh sách từ Supabase
  try {
    const { data, error } = await supabase.from('schedules').select('*');
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    // Fallback mock
    res.json({ success: true, data: [
      { id: '1', title: 'Toán cao cấp', type: 'LECTURE', room: 'A1-201', start_time: new Date().toISOString(), end_time: new Date(new Date().getTime() + 7200000).toISOString(), course_code: 'MAT101' },
      { id: '2', title: 'Lập trình Web', type: 'LECTURE', room: 'B2-302', start_time: new Date(new Date().getTime() + 86400000).toISOString(), end_time: new Date(new Date().getTime() + 86400000 + 7200000).toISOString(), course_code: 'IT302' }
    ]});
  }
});

// Chuyển lịch học sang AI Server để optimize
router.post('/optimize', async (req, res) => {
  try {
    const { events } = req.body;
    const aiResponse = await axios.post('http://127.0.0.1:8000/api/optimize/suggest-slots', { events });
    
    // Demo trả về từ AI
    res.json({
      success: true,
      data: {
        conflicts: [],
        suggested_slots: aiResponse.data.suggested_slots || []
      }
    });
  } catch (error) {
    console.error("Lỗi gọi AI: ", error.message);
    res.json({ success: false, message: 'AI Server is down', data: { conflicts: [], suggested_slots: [] }});
  }
});

// [CF-06] API Import Lịch học từ file PDF/Excel xuất từ cổng trường
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng đính kèm file (.pdf, .xlsx)' });
    }

    const fileExt = req.file.originalname.split('.').pop().toLowerCase();
    let parsedSchedules = [];

    if (fileExt === 'pdf') {
      // Thuật toán trích xuất PDF (pdf-parse)
      const data = await pdf(req.file.buffer);
      const lines = data.text.split('\n');
      for (let line of lines) {
        if (line.includes('Phòng') || line.includes('Tiết')) {
          parsedSchedules.push({ title: line.trim(), type: 'LECTURE', room: 'Extracted Room' });
        }
      }
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      // Thuật toán trích xuất Excel (xlsx)
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet);
      
      rows.forEach(row => {
        parsedSchedules.push({
          title: row['Tên Môn Học'] || row['Course'] || 'Môn học mới',
          room: row['Phòng'] || row['Room'] || 'Chưa xếp phòng',
          type: 'LECTURE'
        });
      });
    } else {
      return res.status(400).json({ success: false, message: 'Định dạng file không hỗ trợ (Chỉ nhận PDF/Excel)' });
    }

    // Insert data into Supabase (nếu có user_id)
    // await supabase.from('schedules').insert(...)

    res.json({ success: true, message: 'Trích xuất dữ liệu thời khóa biểu thành công', count: parsedSchedules.length, data: parsedSchedules });
  } catch (error) {
    console.error('Lỗi Import:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xử lý thuật toán trích xuất: ' + error.message });
  }
});

module.exports = router;
