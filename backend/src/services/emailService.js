const nodemailer = require('nodemailer');

async function sendWeeklyReportEmail(payload) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const emailTo = process.env.REPORT_EMAIL_TO || process.env.SMTP_USER;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return {
      success: false,
      message: 'SMTP chưa được cấu hình. Vui lòng thêm SMTP_HOST, SMTP_USER và SMTP_PASS.',
    };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
    requireTLS: true,
  });

  await transporter.sendMail({
    from: smtpUser,
    to: emailTo,
    subject: payload.subject,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>${payload.subject}</h2>
        <p><strong>Thời gian:</strong> ${new Date(payload.generatedAt).toLocaleString('vi-VN')}</p>
        <ul>
          <li>Sự kiện: ${payload.summary.eventsCount}</li>
          <li>Deadline: ${payload.summary.tasksCount}</li>
          <li>Burnout Score: ${payload.summary.burnoutScore}</li>
          <li>Focus Hours: ${payload.summary.focusHours}</li>
        </ul>
        <p>${payload.highlights.join('</p><p>')}</p>
      </div>
    `,
  });

  return { success: true, message: `Đã gửi email báo cáo tới ${emailTo}.` };
}

module.exports = { sendWeeklyReportEmail };
