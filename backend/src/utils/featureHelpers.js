const crypto = require('node:crypto');

function toIsoDateTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function parseDeadlineMessage(message) {
  if (!message || typeof message !== 'string') {
    return {
      title: 'Deadline chưa rõ',
      dueDate: null,
      confidence: 'low',
      summary: 'Không thể phân tích tin nhắn.',
    };
  }

  const normalized = message.trim();
  const lower = normalized.toLowerCase();

  const titleMatch = normalized.match(/(?:deadline|hạn nộp|nộp|submit)\s+(.*?)(?=\s+(?:nộp|trước|lúc|hôm|đến|vào)\b)/i) ||
    normalized.match(/(?:môn|subject|bài|task|việc)\s+([^,.\n]+)/i);
  const title = titleMatch ? titleMatch[1].trim() : 'Công việc mới';

  const now = new Date();
  const dueDate = new Date(now);
  let hasTime = false;

  const timeMatch = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(h|giờ)?/i);
  const timeWordMatch = normalized.match(/(sáng|chiều|tối|đêm)/i);
  const relativeDayMatch = normalized.match(/(hôm nay|ngày mai|mai|tuần sau)/i);

  if (relativeDayMatch) {
    const dayLabel = relativeDayMatch[1].toLowerCase();
    if (dayLabel === 'hôm nay') {
      dueDate.setDate(now.getDate());
    } else if (dayLabel === 'ngày mai' || dayLabel === 'mai') {
      dueDate.setDate(now.getDate() + 1);
    } else if (dayLabel === 'tuần sau') {
      dueDate.setDate(now.getDate() + 7);
    }
  }

  if (timeMatch) {
    const hour = Number.parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? Number.parseInt(timeMatch[2], 10) : 0;
    const isPm = /tối|chiều|đêm/i.test(lower) && hour < 12;
    dueDate.setHours(isPm ? hour + 12 : hour, minute, 0, 0);
    hasTime = true;
  } else {
    dueDate.setHours(23, 59, 0, 0);
  }

  if (!hasTime && timeWordMatch) {
    const hourMap = { sáng: 8, chiều: 14, tối: 20, đêm: 22 };
    dueDate.setHours(hourMap[timeWordMatch[1].toLowerCase()] || 20, 0, 0, 0);
    hasTime = true;
  }

  const confidence = /deadline|hạn nộp|nộp|submit|trước|lúc/i.test(lower) ? 'high' : 'medium';

  return {
    title,
    dueDate: dueDate.toISOString(),
    confidence,
    summary: `Đã phân tích deadline: ${title} — hạn chót ${dueDate.toLocaleString('vi-VN')}`,
  };
}

function buildIcsCalendar(events) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusFlow//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  const safeEvents = Array.isArray(events) ? events : [];
  safeEvents.forEach((event, index) => {
    const start = event.start ? event.start.replace(/ /g, 'T') : null;
    const end = event.end ? event.end.replace(/ /g, 'T') : start;
    const uid = `${event.id || `event-${index + 1}`}-${crypto.randomUUID()}`;
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const startValue = formatIcsDateTime(start);
    const endValue = formatIcsDateTime(end);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART:${startValue}`);
    lines.push(`DTEND:${endValue}`);
    lines.push(`SUMMARY:${escapeIcsText(event.title || 'CampusFlow Event')}`);
    lines.push(`DESCRIPTION:${escapeIcsText(event.description || 'Tạo từ CampusFlow')}`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function formatIcsDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcsText(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r/g, '')
    .replace(/\n/g, '\\n');
}

function calculateGroupFreeTime(groupSchedules, dayStart, dayEnd, durationMinutes = 60) {
  const members = Array.isArray(groupSchedules) ? groupSchedules : [];
  if (!members.length) return [];

  const freeWindowsPerMember = members.map((busySlots) => getFreeWindows(busySlots || [], dayStart, dayEnd));
  let intersection = freeWindowsPerMember[0] || [];

  for (let index = 1; index < freeWindowsPerMember.length; index += 1) {
    intersection = intersectWindows(intersection, freeWindowsPerMember[index]);
  }

  return intersection
    .filter((window) => window.durationMinutes >= durationMinutes)
    .map((window) => ({
      ...window,
      durationMinutes: window.durationMinutes,
      label: `Khung chung ${Math.round(window.durationMinutes / 60)}h`,
    }));
}

function getFreeWindows(busySlots, dayStart, dayEnd) {
  const sortedBusy = (busySlots || [])
    .map((slot) => ({
      start: new Date(slot.start),
      end: new Date(slot.end),
    }))
    .filter((slot) => !Number.isNaN(slot.start.getTime()) && !Number.isNaN(slot.end.getTime()))
    .sort((a, b) => a.start - b.start);

  const windows = [];
  let cursor = new Date(dayStart);
  const safeDayEnd = new Date(dayEnd);

  sortedBusy.forEach((slot) => {
    if (slot.start > cursor) {
      const durationMinutes = Math.max(0, Math.round((slot.start - cursor) / (1000 * 60)));
      if (durationMinutes > 0) {
        windows.push({
          start: cursor.toISOString(),
          end: slot.start.toISOString(),
          durationMinutes,
        });
      }
    }

    if (slot.end > cursor) {
      cursor = slot.end;
    }
  });

  if (safeDayEnd > cursor) {
    const durationMinutes = Math.max(0, Math.round((safeDayEnd - cursor) / (1000 * 60)));
    if (durationMinutes > 0) {
      windows.push({
        start: cursor.toISOString(),
        end: safeDayEnd.toISOString(),
        durationMinutes,
      });
    }
  }

  return windows;
}

function intersectWindows(left, right) {
  const result = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    const leftWindow = left[leftIndex];
    const rightWindow = right[rightIndex];
    const overlapStart = new Date(Math.max(new Date(leftWindow.start), new Date(rightWindow.start)));
    const overlapEnd = new Date(Math.min(new Date(leftWindow.end), new Date(rightWindow.end)));

    if (overlapStart < overlapEnd) {
      const durationMinutes = Math.max(0, Math.round((overlapEnd - overlapStart) / (1000 * 60)));
      if (durationMinutes > 0) {
        result.push({
          start: overlapStart.toISOString(),
          end: overlapEnd.toISOString(),
          durationMinutes,
        });
      }
    }

    if (new Date(leftWindow.end) <= new Date(rightWindow.end)) {
      leftIndex += 1;
    } else {
      rightIndex += 1;
    }
  }

  return result;
}

function buildWeeklySummaryPayload() {
  const now = new Date();
  return {
    generatedAt: now.toISOString(),
    subject: 'Báo cáo tổng kết CampusFlow tuần này',
    summary: {
      eventsCount: 5,
      tasksCount: 7,
      burnoutScore: 61,
      focusHours: 4,
    },
    highlights: [
      'Bạn đã hoàn thành 7/10 task tuần này.',
      'Có 3 deadline sắp tới trong 48 giờ.',
      'Đề xuất ưu tiên thời gian tự học vào tối thứ 4.',
    ],
  };
}

function validateGpsCheckin({ latitude, longitude, eventLatitude, eventLongitude, allowedRadiusMeters = 120 }) {
  const distanceMeters = haversineDistanceMeters(
    Number(latitude),
    Number(longitude),
    Number(eventLatitude),
    Number(eventLongitude),
  );

  return {
    success: distanceMeters <= allowedRadiusMeters,
    distanceMeters: Math.round(distanceMeters),
    allowedRadiusMeters,
    message: distanceMeters <= allowedRadiusMeters
      ? 'Check-in thành công. Bạn đang ở đúng vị trí sự kiện.'
      : 'Bạn đang quá xa địa điểm tổ chức. Hãy di chuyển gần hơn.',
  };
}

function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  if ([lat1, lon1, lat2, lon2].some((value) => Number.isNaN(Number(value)))) {
    return Number.POSITIVE_INFINITY;
  }

  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

module.exports = {
  parseDeadlineMessage,
  buildIcsCalendar,
  calculateGroupFreeTime,
  buildWeeklySummaryPayload,
  validateGpsCheckin,
};
