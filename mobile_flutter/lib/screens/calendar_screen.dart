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
  List<dynamic> _schedules = [];
  bool _isLoading = false;
  bool _isOptimizing = false;

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
          setState(() => _schedules = data['data']);
        }
      } else {
        debugPrint('Failed to load schedules: ${response.statusCode}');
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
          const Text('Thời khóa biểu', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
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
            : _schedules.isEmpty 
                ? const Center(child: Text("Không có lịch trình nào hôm nay", style: TextStyle(color: Colors.grey)))
                  : Expanded(
                    child: Builder(
                      builder: (ctx) {
                        final Map<String, List<dynamic>> grouped = {};
                        for (var s in _schedules) {
                          final dt = DateTime.parse(s['start_time']).toLocal();
                          final weekdays = ['CN', '2', '3', '4', '5', '6', '7'];
                          final dateStr = 'Thứ ${weekdays[dt.weekday % 7]}, ${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
                          if (!grouped.containsKey(dateStr)) grouped[dateStr] = [];
                          grouped[dateStr]!.add(s);
                        }
                        
                        // Sort schedules by start_time just in case
                        for (var list in grouped.values) {
                          list.sort((a, b) => DateTime.parse(a['start_time']).compareTo(DateTime.parse(b['start_time'])));
                        }
                        
                        final sortedKeys = grouped.keys.toList();
                        
                        return ListView.builder(
                          itemCount: sortedKeys.length,
                          itemBuilder: (ctx, index) {
                            final dateKey = sortedKeys[index];
                            final items = grouped[dateKey]!;
                            
                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  child: Text(dateKey, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.blueAccent)),
                                ),
                                ...items.map((s) {
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
                                          Container(width: 4, color: s['type'] == 'LECTURE' ? Colors.blue : (s['type'] == 'EVENT' ? Colors.orange : Colors.green)),
                                          Expanded(
                                            child: Padding(
                                              padding: const EdgeInsets.all(12),
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(s['course_code'], style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold)),
                                                  Text(s['title'] ?? s['course_name'] ?? 'Không tên', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                                  const SizedBox(height: 4),
                                                  Text('📍 ${s['room'] ?? 'Đang cập nhật'}', style: const TextStyle(color: Colors.grey)),
                                                ],
                                              ),
                                            ),
                                          )
                                        ],
                                      ),
                                    ),
                                  );
                                }),
                              ],
                            );
                          },
                        );
                      }
                    )
                  )
        ],
      ),
    );
  }
}
