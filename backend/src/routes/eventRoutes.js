const express = require('express');
const router = express.Router();
const { listEvents, checkIn, exportIcs } = require('../controllers/eventController');

// Lấy danh sách sự kiện Campus Life
router.get('/', listEvents);
router.post('/checkin', checkIn);
router.post('/export-ics', exportIcs);

module.exports = router;
