const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../config/supabase');

// Middleware Multer (giới hạn 10MB)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// [CF-39] Hàm kiểm tra quota storage
async function checkAndUpdateQuota(userId, fileSize) {
  if (!userId) return true; // Bỏ qua nếu là guest/anon
  
  let { data: quota } = await supabase.from('storage_quotas').select('*').eq('user_id', userId).single();
  
  if (!quota) {
    // Khởi tạo quota mặc định 50MB
    const { data: newQuota } = await supabase.from('storage_quotas').insert([{ user_id: userId }]).select().single();
    quota = newQuota;
  }

  if (quota.used_bytes + fileSize > quota.limit_bytes) {
    throw new Error('Vượt quá hạn mức lưu trữ (Quota Exceeded)');
  }

  // Cập nhật used_bytes
  await supabase.from('storage_quotas').update({ used_bytes: quota.used_bytes + fileSize }).eq('user_id', userId);
  return true;
}

// [CF-14] API Upload file tài liệu đính kèm lên Storage
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file' });
    }

    // Lấy user_id từ header hoặc giả lập
    const userId = req.headers['x-user-id']; // Trong thực tế lấy từ JWT token

    // Kiểm tra quota (CF-39)
    if (userId) {
      await checkAndUpdateQuota(userId, req.file.size);
    }

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    // Upload lên Supabase Storage bucket 'campusflow-docs'
    const { data, error } = await supabase.storage
      .from('campusflow-docs')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) throw error;

    // Lấy link public URL
    const { data: publicUrlData } = supabase.storage.from('campusflow-docs').getPublicUrl(filePath);

    res.json({
      success: true,
      message: 'Upload file thành công',
      url: publicUrlData.publicUrl,
      size: req.file.size
    });

  } catch (error) {
    console.error('Lỗi Upload:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// [CF-39] Lấy thông tin Quota
router.get('/quota', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const { data: quota, error } = await supabase.from('storage_quotas').select('*').eq('user_id', userId).single();
  if (error && error.code !== 'PGRST116') {
    return res.status(500).json({ success: false, message: error.message });
  }

  res.json({ success: true, data: quota || { used_bytes: 0, limit_bytes: 52428800 } });
});

module.exports = router;
