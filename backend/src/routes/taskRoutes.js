const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Lấy danh sách công việc (Tasks & Deadlines)
router.get('/', async (req, res) => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: tasks || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Thêm một công việc mới
router.post('/', async (req, res) => {
  try {
    const { title, course_code, priority, due_date } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Tiêu đề không được để trống' });
    }
    
    const newTask = {
      title,
      course_code,
      priority: priority || 'MEDIUM',
      status: 'TODO',
      due_date: due_date || new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0], message: 'Tạo công việc thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Đánh dấu hoàn thành / Chỉnh sửa
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Xóa công việc
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Đã xóa công việc' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
