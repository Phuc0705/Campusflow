const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase'); // This is the admin/service role client usually, or at least a regular client.

// Dữ liệu giả lập (Mock Data) từ hệ thống Quản lý Đào tạo của Trường
const MOCK_UNIVERSITY_DATABASE = {
  '2302700001': {
    name: 'Nguyễn Văn An',
    major: 'Kỹ thuật Phần mềm',
    year: 'K68',
    schedules: [
      { course_code: 'IT3040', course_name: 'Nhập môn CNPM', type: 'LECTURE', start_offset_days: 0, duration_hours: 2 },
      { course_code: 'IT3170', course_name: 'Thuật toán ứng dụng', type: 'LAB', start_offset_days: 1, duration_hours: 3 },
    ]
  },
  '2302700002': {
    name: 'Trần Thị Bình',
    major: 'Khoa học Máy tính',
    year: 'K68',
    schedules: [
      { course_code: 'IT3040', course_name: 'Nhập môn CNPM', type: 'LECTURE', start_offset_days: 0, duration_hours: 2 },
      { course_code: 'IT3100', course_name: 'Lập trình Hướng đối tượng', type: 'LECTURE', start_offset_days: 2, duration_hours: 2 },
    ]
  },
  '2302700003': {
    name: 'Lê Hoàng Cường',
    major: 'An toàn Thông tin',
    year: 'K68',
    schedules: [
      { course_code: 'IT3120', course_name: 'Cơ sở dữ liệu', type: 'LECTURE', start_offset_days: 1, duration_hours: 2 },
      { course_code: 'IT3120', course_name: 'Thực hành CSDL', type: 'LAB', start_offset_days: 3, duration_hours: 3 },
    ]
  },
  '2302700004': {
    name: 'Phạm Minh Dũng',
    major: 'Hệ thống Thông tin',
    year: 'K68',
    schedules: [
      { course_code: 'IT3150', course_name: 'Kiến trúc máy tính', type: 'LECTURE', start_offset_days: 0, duration_hours: 2 },
      { course_code: 'IT3160', course_name: 'Hệ điều hành', type: 'LECTURE', start_offset_days: 2, duration_hours: 2 },
    ]
  }
};

router.post('/mock-sso', async (req, res) => {
  const { mssv, password } = req.body;

  if (!mssv || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ MSSV và Mật khẩu' });
  }

  if (password !== '123456') {
    return res.status(401).json({ success: false, message: 'Mật khẩu không đúng. Mật khẩu mặc định là 123456' });
  }

  const studentData = MOCK_UNIVERSITY_DATABASE[mssv];
  if (!studentData) {
    return res.status(404).json({ 
      success: false, 
      message: 'MSSV không tồn tại trong hệ thống đào tạo. Vui lòng thử các mã: 2302700001, 2302700002, 2302700003, 2302700004' 
    });
  }

  const mockEmail = `${mssv}@student.mock.edu.vn`;
  const mockPassword = 'CampusFlowSSO123!';

  try {
    // 1. Cố gắng đăng nhập trước
    let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: mockEmail,
      password: mockPassword,
    });

    // 2. Nếu lỗi do chưa tồn tại tài khoản -> Đăng ký mới
    if (authError && authError.message.includes('Invalid login credentials')) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: mockEmail,
        password: mockPassword,
        data: {
          full_name: studentData.name,
          major: studentData.major,
          academic_year: studentData.year
        }
      });
      if (signUpError) throw signUpError;
      authData = signUpData;
    } else if (authError) {
      throw authError;
    }

    // 3. Tài khoản đã tồn tại, ta cập nhật lại thông tin cá nhân cho chắc chắn (vì SSO luôn lấy dữ liệu mới từ trường)
    await supabase.auth.updateUser({
      data: {
        full_name: studentData.name,
        major: studentData.major,
        academic_year: studentData.year
      }
    });

    // 4. Đồng bộ hóa lịch học (Xóa lịch cũ, thêm lịch mới từ hệ thống trường)
    const userId = authData.user.id;
    const token = authData.session.access_token;

    // Xóa lịch cũ
    await supabase
      .from('schedules')
      .delete()
      .eq('user_id', userId);

    // Tính toán ngày giờ linh hoạt (để lúc nào sinh viên demo cũng thấy lịch ở trong tuần hiện tại)
    const mockSchedules = studentData.schedules.map(course => {
      const start = new Date();
      start.setDate(start.getDate() + course.start_offset_days);
      start.setHours(8, 0, 0, 0); // Bắt đầu lúc 8h sáng

      const end = new Date(start);
      end.setHours(start.getHours() + course.duration_hours);

      return {
        user_id: userId,
        course_code: course.course_code,
        course_name: course.course_name,
        type: course.type,
        start_time: start.toISOString(),
        end_time: end.toISOString()
      };
    });

    // Thêm lịch mới
    const { error: insertError } = await supabase
      .from('schedules')
      .insert(mockSchedules);

    if (insertError) throw insertError;

    // 5. Trả về credentials cho App Flutter để App tự động login
    res.json({
      success: true,
      message: 'SSO Login thành công, dữ liệu đã được đồng bộ',
      data: {
        email: mockEmail,
        password: mockPassword,
        profile: studentData
      }
    });

  } catch (error) {
    console.error('SSO Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi đồng bộ SSO: ' + error.message });
  }
});

module.exports = router;
