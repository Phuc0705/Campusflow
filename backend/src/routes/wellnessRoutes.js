const express = require('express');
const router = express.Router();

// Lấy thông số Sức khỏe tinh thần (Wellness & Burnout)
router.get('/', async (req, res) => {
  try {
    // Mock data tổng hợp số giờ học/làm/ngủ trong tuần
    const wellnessData = {
      study_hours: 32, // Tổng số giờ tự học + lên lớp
      work_hours: 18,  // Giờ làm thêm
      sleep_hours_avg: 5.5, // Ngủ trung bình mỗi đêm
    };

    // Thuật toán đơn giản tính điểm kiệt sức (Burnout Score)
    // - Ngủ dưới 7 tiếng: phạt nặng
    // - Học + Làm > 45 tiếng: phạt
    let burnout_score = 0;
    
    if (wellnessData.sleep_hours_avg < 7) {
      burnout_score += (7 - wellnessData.sleep_hours_avg) * 15;
    }
    
    const total_workload = wellnessData.study_hours + wellnessData.work_hours;
    if (total_workload > 45) {
      burnout_score += (total_workload - 45) * 2;
    }

    // Đảm bảo score từ 0-100
    burnout_score = Math.min(100, Math.max(0, burnout_score));

    let status = 'Bình thường';
    let message = 'Bạn đang cân bằng tốt. Hãy tiếp tục phát huy!';
    let color = '#10b981'; // Green

    if (burnout_score > 80) {
      status = 'Báo động đỏ (Kiệt sức)';
      message = 'Bạn đang làm việc quá sức và thiếu ngủ trầm trọng! Hãy kích hoạt Focus Mode để hoàn thành nhanh task và đi ngủ sớm.';
      color = '#ef4444'; // Red
    } else if (burnout_score > 50) {
      status = 'Căng thẳng nhẹ';
      message = 'Bạn đang khá bận rộn. Đừng quên dành 15 phút nghỉ ngơi nhé.';
      color = '#f59e0b'; // Yellow
    }

    res.json({ 
      success: true, 
      data: {
        ...wellnessData,
        burnout_score: Math.round(burnout_score),
        status,
        message,
        color
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
