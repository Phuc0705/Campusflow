import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:supabase_flutter/supabase_flutter.dart';

class EventScreen extends StatefulWidget {
  const EventScreen({super.key});

  @override
  State<EventScreen> createState() => _EventScreenState();
}

class _EventScreenState extends State<EventScreen> {
  List<dynamic> _events = [];
  bool _isLoading = true;
  final String _apiUrl = 'http://127.0.0.1:3000/api/events';

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
    _fetchEvents();
  }

  Future<void> _fetchEvents() async {
    try {
      final response = await http.get(Uri.parse(_apiUrl), headers: _getHeaders());
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          setState(() {
            _events = data['data'];
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      debugPrint('Error fetching events: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _registerEvent(String eventId) async {
    try {
      // Hiện dialog tiến trình
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => const Center(child: CircularProgressIndicator()),
      );

      final response = await http.post(
        Uri.parse('$_apiUrl/register'),
        headers: _getHeaders(),
        body: json.encode({'event_id': eventId}),
      );
      
      // Đóng dialog tiến trình
      if (mounted) Navigator.pop(context);

      final data = json.decode(response.body);
      
      if (response.statusCode == 200 && data['success']) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(data['message'] ?? 'Đăng ký thành công!'),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 3),
          ),
        );
        _fetchEvents(); // Refresh data
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(data['message'] ?? 'Đã có lỗi xảy ra'),
            backgroundColor: Colors.redAccent,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      if (mounted) Navigator.pop(context);
      debugPrint('Error registering: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi kết nối máy chủ'), backgroundColor: Colors.redAccent),
      );
    }
  }

  String _formatDateTime(String isoStr) {
    final dt = DateTime.parse(isoStr).toLocal();
    return '${dt.day}/${dt.month}/${dt.year} - ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text('Sự kiện Campus', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 1,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _events.isEmpty
              ? const Center(child: Text("Hiện chưa có sự kiện nào sắp diễn ra", style: TextStyle(color: Colors.grey)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _events.length,
                  itemBuilder: (ctx, i) {
                    final event = _events[i];
                    final isRegistered = event['is_registered'] == true;

                    return Card(
                      color: Colors.white,
                      margin: const EdgeInsets.only(bottom: 16),
                      clipBehavior: Clip.antiAlias,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 2,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            height: 120,
                            width: double.infinity,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [Colors.blue.shade400, Colors.deepPurple.shade400],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                            ),
                            child: const Center(
                              child: Icon(Icons.celebration, color: Colors.white, size: 48),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: Colors.orange[50],
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        event['organizer'] ?? 'Ban tổ chức',
                                        style: const TextStyle(color: Colors.deepOrange, fontSize: 12, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                    if (event['points'] != null && event['points'] > 0)
                                      Row(
                                        children: [
                                          const Icon(Icons.star, color: Colors.amber, size: 16),
                                          const SizedBox(width: 4),
                                          Text('+${event['points']} điểm', style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 12)),
                                        ],
                                      )
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  event['title'] ?? 'Sự kiện Không tên',
                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    Icon(Icons.calendar_today, size: 16, color: Colors.grey[600]),
                                    const SizedBox(width: 8),
                                    Text(_formatDateTime(event['start_time']), style: TextStyle(color: Colors.grey[700])),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Icon(Icons.location_on, size: 16, color: Colors.grey[600]),
                                    const SizedBox(width: 8),
                                    Text(event['location'] ?? 'Chưa cập nhật', style: TextStyle(color: Colors.grey[700])),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  event['description'] ?? '',
                                  style: TextStyle(color: Colors.grey[600]),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 16),
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: isRegistered ? Colors.grey[300] : Colors.blueAccent,
                                      foregroundColor: isRegistered ? Colors.grey[700] : Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 12),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                      elevation: isRegistered ? 0 : 2,
                                    ),
                                    onPressed: isRegistered ? null : () => _registerEvent(event['id']),
                                    child: Text(
                                      isRegistered ? 'Đã Đăng Ký Tham Gia' : 'Đăng Ký Tham Gia',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                    ),
                                  ),
                                )
                              ],
                            ),
                          )
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}
