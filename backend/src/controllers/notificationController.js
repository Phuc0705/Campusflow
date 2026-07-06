const { parseDeadlineMessage, buildWeeklySummaryPayload } = require('../utils/featureHelpers');
const { sendWeeklyReportEmail } = require('../services/emailService');
const supabase = require('../config/supabase');

async function parseDeadline(req, res) {
  try {
    const { message, userId } = req.body;
    const parsed = parseDeadlineMessage(message);

    if (supabase && userId) {
      try {
        await supabase.from('deadline_parses').insert([{ user_id: userId, source: 'telegram_or_zalo', raw_message: message, parsed_data: parsed }]);
      } catch (dbError) {
        console.warn('Không thể ghi deadline parse vào DB:', dbError.message);
      }
    }

    res.json({ success: true, data: parsed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function sendWeeklyReport(req, res) {
  try {
    const payload = buildWeeklySummaryPayload();
    const result = await sendWeeklyReportEmail(payload);
    res.json({ success: true, data: payload, message: result.message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { parseDeadline, sendWeeklyReport };
