const express = require('express');
const router = express.Router();
// const supabase = require('../config/supabase');

// Mock SSO Login cho sinh viên các trường
router.post('/sso-login', async (req, res) => {
  const { ssoToken, universityId } = req.body;

  // Trong thực tế sẽ verify ssoToken với cổng trường hoặc Identity Provider
  if (!ssoToken || !universityId) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin SSO' });
  }

  try {
    // Mock user profile trả về
    const userProfile = {
      id: 'mock-uuid-1234',
      full_name: 'Nguyễn Văn A',
      email: 'a.nv2000@student.university.edu.vn',
      university: universityId,
      major: 'Khoa học Máy tính',
      cohort: 'K65',
      token: 'mock-jwt-token-campusflow'
    };

    res.json({ success: true, data: userProfile, message: 'Đăng nhập thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
