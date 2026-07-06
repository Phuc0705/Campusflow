// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();

// API trả về biểu đồ Realtime lượng User/Request cho [CF-35]
router.get('/dashboard-stats', (req, res) => {
    try {
        // Mock data để demo dashboard ngày mai
        const stats = {
            total_users: 1250,
            active_today: 342,
            total_requests: 8754,
            system_health: {
                cpu: "42%",
                memory: "65%",
                status: "Tốt"
            }
        };

        res.json({
            success: true,
            message: 'Lấy dữ liệu thống kê Admin thành công',
            data: stats
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi tải thống kê' });
    }
});

module.exports = router;