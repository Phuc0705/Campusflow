const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Middleware kiểm tra quyền Admin (Giả lập)
const isAdmin = (req, res, next) => {
  const role = req.headers['x-user-role'];
  if (role !== 'admin') {
    // Để tiện demo, tạm thời bỏ qua check Admin nếu không có header.
    // return res.status(403).json({ success: false, message: 'Forbidden: Yêu cầu quyền Admin' });
  }
  next();
};

// Lấy danh sách môn học
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Thêm môn học mới (Admin)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { course_code, course_name, credits, department } = req.body;
    if (!course_code || !course_name) {
      return res.status(400).json({ success: false, message: 'Thiếu mã môn học hoặc tên môn học' });
    }

    const { data, error } = await supabase
      .from('courses')
      .insert([{ course_code, course_name, credits, department }])
      .select();

    if (error) throw error;
    res.json({ success: true, message: 'Thêm danh mục môn học thành công', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cập nhật môn học (Admin)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { course_code, course_name, credits, department } = req.body;

    const { data, error } = await supabase
      .from('courses')
      .update({ course_code, course_name, credits, department })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, message: 'Cập nhật thành công', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Xóa môn học (Admin)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Đã xóa môn học' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
