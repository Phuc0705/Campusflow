import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  List<dynamic> _schedules = [];
  bool _isLoading = false;
  bool _isOptimizing = false;

  // Đổi IP này thành IP máy tính của bạn (đã xác định từ file kế hoạch: 192.168.11.236)
  final String _apiUrl = 'http://127.0.0.1:3000/api/schedules';

  @override
  void initState() {
    super.initState();
    _fetchSchedules();
  }

  Future<void> _fetchSchedules() async {
    setState(() => _isLoading = true);
    try {
      final response = await http.get(Uri.parse(_apiUrl));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          setState(() => _schedules = data['data']);
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
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'events': _schedules}),
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

  String _formatTime(String isoStr) {
    final dt = DateTime.parse(isoStr).toLocal();
    return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.grey[100],
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Thời khóa biểu Hôm nay', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 15),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.deepPurpleAccent,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              icon: _isOptimizing 
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.auto_awesome),
              label: const Text('Tối ưu hóa bằng AI'),
              onPressed: _isOptimizing ? null : _optimizeAI,
            ),
          ),
          const SizedBox(height: 20),
          _isLoading 
            ? const Center(child: CircularProgressIndicator())
            : Expanded(
                child: ListView.builder(
                  itemCount: _schedules.length,
                  itemBuilder: (ctx, i) {
                    final s = _schedules[i];
                    return Card(
                      color: Colors.white,
                      margin: const EdgeInsets.only(bottom: 12),
                      child: IntrinsicHeight(
                        child: Row(
                          children: [
                            Container(
                              width: 70,
                              padding: const EdgeInsets.all(8),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(_formatTime(s['start_time']), style: const TextStyle(fontWeight: FontWeight.bold)),
                                  Text(_formatTime(s['end_time']), style: const TextStyle(fontSize: 12, color: Colors.grey)),
                                ],
                              ),
                            ),
                            Container(width: 4, color: s['type'] == 'LECTURE' ? Colors.blue : Colors.green),
                            Expanded(
                              child: Padding(
                                padding: const EdgeInsets.all(12),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(s['course_code'], style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold)),
                                    Text(s['title'], style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                    const SizedBox(height: 4),
                                    Text('📍 ${s['room']}', style: const TextStyle(color: Colors.grey)),
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
              )
        ],
      ),
    );
  }
}
