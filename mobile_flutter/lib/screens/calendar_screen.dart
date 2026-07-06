import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';

class Event {
  final String title;
  final Color color;
  Event(this.title, this.color);
}

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  CalendarFormat _calendarFormat = CalendarFormat.week;
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  // Dữ liệu giả định để Demo Color Coding
  final Map<DateTime, List<Event>> _events = {
    DateTime.now(): [
      Event('Học Cấu trúc dữ liệu', Colors.blue),
      Event('Deadline: Báo cáo PA06', Colors.red), // Màu đỏ cảnh báo
    ],
  };

  List<Event> _getEventsForDay(DateTime day) {
    // Chuẩn hóa ngày để so sánh (bỏ qua giờ/phút)
    final normalizedDay = DateTime(day.year, day.month, day.day);
    final normalizedToday = DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);
    
    if (normalizedDay == normalizedToday) {
      return _events[DateTime.now()] ?? [];
    }
    return [];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lịch Trình AI')),
      body: Column(
        children: [
          TableCalendar(
            firstDay: DateTime.utc(2023, 1, 1),
            lastDay: DateTime.utc(2030, 12, 31),
            focusedDay: _focusedDay,
            calendarFormat: _calendarFormat,
            selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
            onDaySelected: (selectedDay, focusedDay) {
              setState(() {
                _selectedDay = selectedDay;
                _focusedDay = focusedDay;
              });
            },
            onFormatChanged: (format) {
              setState(() { _calendarFormat = format; });
            },
            eventLoader: _getEventsForDay,
          ),
          const SizedBox(height: 10),
          Expanded(
            child: ListView.builder(
              itemCount: _getEventsForDay(_selectedDay ?? _focusedDay).length,
              itemBuilder: (context, index) {
                final event = _getEventsForDay(_selectedDay ?? _focusedDay)[index];
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    border: Border.all(color: event.color),
                    borderRadius: BorderRadius.circular(12),
                    color: event.color.withValues(alpha: 0.1),
                  ),
                  child: ListTile(
                    leading: Icon(Icons.circle, color: event.color),
                    title: Text(event.title, style: TextStyle(color: event.color, fontWeight: FontWeight.bold)),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
