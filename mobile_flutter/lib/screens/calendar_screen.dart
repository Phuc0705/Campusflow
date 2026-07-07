import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:supabase_flutter/supabase_flutter.dart';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  List<dynamic> _allSchedules = [];
  bool _isLoading = false;
  bool _isOptimizing = false;
  DateTime _selectedDate = DateTime.now();

  final String _apiUrl = 'http://127.0.0.1:3000/api/schedules';

  Map<String, String> _getHeaders() {
    final token = Supabase.instance.client.auth.currentSession?.accessToken;
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  @override
  void initState() {
    super.initState();
    _fetchSchedules();
  }

  Future<void> _fetchSchedules() async {
    setState(() => _isLoading = true);
    try {
      final response = await http.get(Uri.parse(_apiUrl), headers: _getHeaders());
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          setState(() {
            _allSchedules = data['data'];
            // Nếu có dữ liệu, chọn ngày đầu tiên có lịch thay vì hôm nay
            if (_allSchedules.isNotEmpty) {
              _allSchedules.sort((a, b) => DateTime.parse(a['start_time']).compareTo(DateTime.parse(b['start_time'])));
              _selectedDate = DateTime.parse(_allSchedules.first['start_time']).toLocal();
            }
          });
        }
      }
    } catch (e) {
      debugPrint('Error fetching: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _optimizeAI() async {
    setState(() => _isOptimizing = true);
    try {
      final response = await http.post(
        Uri.parse('$_apiUrl/optimize'),
        headers: _getHeaders(),
        body: json.encode({'events': _allSchedules}),
      );
      
      final data = json.decode(response.body);
      if (data['success']) {
        String msg = '';
        if (data['conflicts'].isNotEmpty) {
          msg += '🚨 PHÁT HIỆN TRÙNG LỊCH:\n';
          for (var c in data['conflicts']) {
            msg += '- ${c['message']}\n';
          }
          msg += '\n';
        } else {
          msg += '✅ Lịch trình an toàn.\n\n';
        }
        
        if (data['suggested_slots'].isNotEmpty) {
          msg += '💡 GỢI Ý GIỜ TỰ HỌC:\n';
          for (var s in data['suggested_slots']) {
            final time = DateTime.parse(s['start']).toLocal();
            msg += '- Từ ${time.hour}:${time.minute.toString().padLeft(2, '0')}: ${s['message']}\n';
          }
        }
        
        _showDialog('Kết quả AI', msg);
      }
    } catch (e) {
      _showDialog('Lỗi', 'Không thể kết nối đến máy chủ AI');
    } finally {
      setState(() => _isOptimizing = false);
    }
  }

  void _showDialog(String title, String content) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: Text(content),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('OK'))
        ],
      ),
    );
  }

  String _formatTimeOnly(String isoStr) {
    final dt = DateTime.parse(isoStr).toLocal();
    return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }

  List<dynamic> get _schedulesForSelectedDate {
    return _allSchedules.where((s) {
      final dt = DateTime.parse(s['start_time']).toLocal();
      return dt.year == _selectedDate.year && dt.month == _selectedDate.month && dt.day == _selectedDate.day;
    }).toList();
  }

  // Lấy danh sách 7 ngày bắt đầu từ Chủ Nhật tuần hiện tại hoặc đầu tuần của selectedDate
  List<DateTime> _getWeekDays() {
    int currentWeekday = _selectedDate.weekday; // 1 (Mon) to 7 (Sun)
    DateTime startOfWeek = _selectedDate.subtract(Duration(days: currentWeekday - 1)); // Thứ 2
    return List.generate(7, (index) => startOfWeek.add(Duration(days: index)));
  }

  @override
  Widget build(BuildContext context) {
    final user = Supabase.instance.client.auth.currentUser;
    final fullName = user?.userMetadata?['full_name'] ?? 'Sinh viên';
    final weekDays = _getWeekDays();
    final currentSchedules = _schedulesForSelectedDate;

    return Scaffold(
      backgroundColor: const Color(0xFFF6F7FB),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF6F7FB),
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () {}, // Nút giả để giống UI
        ),
        title: Column(
          children: [
            const Text('Thời khóa biểu', style: TextStyle(color: Colors.black, fontSize: 18, fontWeight: FontWeight.bold)),
            Text('Sinh viên: $fullName', style: const TextStyle(color: Colors.indigo, fontSize: 12, fontWeight: FontWeight.w600)),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.more_vert, color: Colors.black), onPressed: () {}),
        ],
      ),
      body: Column(
        children: [
          // Tabs
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Color(0xFFE0E0E0))),
            ),
            child: Row(
              children: [
                _buildTab('Theo ngày', isActive: true),
                const SizedBox(width: 24),
                _buildTab('Theo tuần'),
                const SizedBox(width: 24),
                _buildTab('Theo tháng'),
              ],
            ),
          ),
          
          // Date selector header
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${_selectedDate.day} Tháng ${_selectedDate.month}, ${_selectedDate.year}',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black87),
                ),
                Row(
                  children: [
                    _buildNavButton(Icons.chevron_left, () {
                      setState(() => _selectedDate = _selectedDate.subtract(const Duration(days: 1)));
                    }),
                    const SizedBox(width: 8),
                    _buildNavButton(Icons.calendar_today, () {}),
                    const SizedBox(width: 8),
                    _buildNavButton(Icons.chevron_right, () {
                      setState(() => _selectedDate = _selectedDate.add(const Duration(days: 1)));
                    }),
                  ],
                )
              ],
            ),
          ),

          // Week days strip
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: weekDays.map((date) {
                bool isSelected = date.day == _selectedDate.day && date.month == _selectedDate.month;
                String dayName = date.weekday == 7 ? 'CN' : 'T${date.weekday + 1}';
                return GestureDetector(
                  onTap: () => setState(() => _selectedDate = date),
                  child: Column(
                    children: [
                      Text(dayName, style: TextStyle(color: isSelected ? Colors.indigo : Colors.indigo[300], fontWeight: FontWeight.w600, fontSize: 13)),
                      const SizedBox(height: 8),
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF003380) : Colors.transparent,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          '${date.day}',
                          style: TextStyle(
                            color: isSelected ? Colors.white : Colors.black87,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      // Chấm xanh/cam hiển thị dựa trên lịch học thực tế
                      Builder(
                        builder: (ctx) {
                          bool hasLecture = _allSchedules.any((s) {
                            final dt = DateTime.parse(s['start_time']).toLocal();
                            return dt.year == date.year && dt.month == date.month && dt.day == date.day && s['type'] != 'EVENT';
                          });
                          bool hasEvent = _allSchedules.any((s) {
                            final dt = DateTime.parse(s['start_time']).toLocal();
                            return dt.year == date.year && dt.month == date.month && dt.day == date.day && s['type'] == 'EVENT';
                          });
                          
                          return Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              if (hasLecture) Container(width: 6, height: 6, margin: const EdgeInsets.only(right: 2), decoration: const BoxDecoration(color: Colors.blueAccent, shape: BoxShape.circle)),
                              if (hasEvent) Container(width: 6, height: 6, decoration: const BoxDecoration(color: Colors.orangeAccent, shape: BoxShape.circle)),
                              if (!hasLecture && !hasEvent) const SizedBox(height: 6), // Giữ không gian trống
                            ],
                          );
                        }
                      )
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Nút AI
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF8154F8),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))
                ),
                icon: _isOptimizing 
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.auto_awesome, size: 18),
                label: const Text('Tối ưu hóa bằng AI'),
                onPressed: _isOptimizing ? null : _optimizeAI,
              ),
            ),
          ),
          
          const SizedBox(height: 16),

          // Timeline List
          Expanded(
            child: _isLoading 
                ? const Center(child: CircularProgressIndicator())
                : currentSchedules.isEmpty
                    ? const Center(child: Text("Không có lịch học nào trong ngày này", style: TextStyle(color: Colors.grey)))
                    : ListView.builder(
                        padding: const EdgeInsets.only(bottom: 24),
                        itemCount: currentSchedules.length,
                        itemBuilder: (context, index) {
                          final s = currentSchedules[index];
                          final isExam = s['type'] == 'EVENT';
                          final colorTheme = isExam ? Colors.deepOrange : const Color(0xFF6C63FF);
                          final bgColor = isExam ? Colors.orange[50] : Colors.white;
                          
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                            child: IntrinsicHeight(
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  // Time column
                                  SizedBox(
                                    width: 50,
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(_formatTimeOnly(s['start_time']), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                                        const SizedBox(height: 4),
                                        Text(_formatTimeOnly(s['end_time']), style: TextStyle(color: Colors.indigo[400], fontSize: 14)),
                                      ],
                                    ),
                                  ),
                                  // Timeline line
                                  Container(
                                    width: 2,
                                    margin: const EdgeInsets.symmetric(horizontal: 12),
                                    color: Colors.grey[300],
                                  ),
                                  // Event Card
                                  Expanded(
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: bgColor,
                                        borderRadius: BorderRadius.circular(12),
                                        boxShadow: [
                                          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))
                                        ],
                                        border: Border(left: BorderSide(color: colorTheme, width: 4))
                                      ),
                                      padding: const EdgeInsets.all(16),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          // Badge
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: colorTheme.withOpacity(0.1),
                                              borderRadius: BorderRadius.circular(4)
                                            ),
                                            child: Text(
                                              isExam ? 'LỊCH THI' : 'SẮP TỚI',
                                              style: TextStyle(color: colorTheme, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)
                                            ),
                                          ),
                                          const SizedBox(height: 8),
                                          Text(s['course_code'], style: TextStyle(color: Colors.indigo[800], fontWeight: FontWeight.bold, fontSize: 12)),
                                          const SizedBox(height: 4),
                                          Text(s['title'] ?? s['course_name'] ?? 'Không tên', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black87)),
                                          const SizedBox(height: 12),
                                          // Info row
                                          Row(
                                            children: [
                                              Icon(Icons.door_front_door, size: 14, color: Colors.indigo[300]),
                                              const SizedBox(width: 4),
                                              Text('${s['room'] ?? 'P.TBD'}', style: TextStyle(color: Colors.grey[700], fontSize: 12)),
                                              const SizedBox(width: 12),
                                              Icon(Icons.people, size: 14, color: Colors.indigo[300]),
                                              const SizedBox(width: 4),
                                              Text('68', style: TextStyle(color: Colors.grey[700], fontSize: 12)),
                                              const SizedBox(width: 12),
                                              Icon(Icons.book, size: 14, color: Colors.indigo[300]),
                                              const SizedBox(width: 4),
                                              Text(s['type'] == 'LAB' ? 'LAB' : 'LEC', style: TextStyle(color: Colors.grey[700], fontSize: 12)),
                                            ],
                                          ),
                                          const SizedBox(height: 8),
                                          // Teacher
                                          Row(
                                            children: [
                                              Icon(Icons.person, size: 14, color: Colors.indigo[300]),
                                              const SizedBox(width: 4),
                                              Expanded(
                                                child: Text(
                                                  'Giảng viên phụ trách',
                                                  style: TextStyle(color: Colors.indigo[400], fontSize: 12),
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              )
                                            ],
                                          )
                                        ],
                                      ),
                                    ),
                                  )
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildTab(String title, {bool isActive = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        border: isActive ? const Border(bottom: BorderSide(color: Color(0xFF003380), width: 2)) : null,
      ),
      child: Text(
        title, 
        style: TextStyle(
          color: isActive ? const Color(0xFF003380) : Colors.grey[600],
          fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
          fontSize: 14,
        )
      ),
    );
  }

  Widget _buildNavButton(IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.grey[200],
          borderRadius: BorderRadius.circular(8)
        ),
        child: Icon(icon, size: 18, color: Colors.black87),
      ),
    );
  }
}
