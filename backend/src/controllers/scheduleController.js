const { calculateGroupFreeTime } = require('../utils/featureHelpers');

async function getGroupFreeTime(req, res) {
  try {
    const { members, dayStart, dayEnd, durationMinutes = 60 } = req.body;
    const windows = calculateGroupFreeTime(members, dayStart, dayEnd, durationMinutes);
    res.json({ success: true, data: windows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { getGroupFreeTime };
