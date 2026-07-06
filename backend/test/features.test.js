const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parseDeadlineMessage,
  calculateGroupFreeTime,
  buildIcsCalendar,
} = require('../src/utils/featureHelpers');

test('parseDeadlineMessage extracts deadline details from a message', () => {
  const result = parseDeadlineMessage('Zalo: Deadline môn PM nộp báo cáo trước 20h tối nay');

  assert.equal(result.title, 'môn PM');
  assert.equal(result.confidence, 'high');
  assert.ok(result.dueDate);
});

test('calculateGroupFreeTime intersects available windows', () => {
  const result = calculateGroupFreeTime(
    [
      [{ start: '2026-07-07T09:00:00', end: '2026-07-07T11:00:00' }],
      [{ start: '2026-07-07T10:00:00', end: '2026-07-07T12:00:00' }],
    ],
    '2026-07-07T08:00:00',
    '2026-07-07T14:00:00',
    60,
  );

  assert.ok(result.length >= 1);
  assert.equal(result[0].durationMinutes, 60);
});

test('buildIcsCalendar returns valid ICS content', () => {
  const ics = buildIcsCalendar([
    { title: 'Họp nhóm', start: '2026-07-07T19:00:00', end: '2026-07-07T20:00:00' },
  ]);

  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /BEGIN:VEVENT/);
  assert.match(ics, /SUMMARY:Họp nhóm/);
});
