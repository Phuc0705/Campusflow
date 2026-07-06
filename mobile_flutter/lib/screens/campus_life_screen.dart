import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class CampusLifeScreen extends StatefulWidget {
  const CampusLifeScreen({super.key});

  @override
  State<CampusLifeScreen> createState() => _CampusLifeScreenState();
}

class _CampusLifeScreenState extends State<CampusLifeScreen> {
  List<dynamic> _events = [];
  bool _isLoading = true;
  bool _isCheckingIn = false;
  final String _apiUrl = 'http://192.168.11.236:3000/api/events';

  @override
  void initState() {
    super.initState();
    _fetchEvents();
  }

  Future<void> _fetchEvents() async {
    try {
      final response = await http.get(Uri.parse(_apiUrl));
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
      debugPrint('Error: $e');
      setState(() => _isLoading = false);
    }
  }

  void _showQRDialog(String eventId) {
    final TextEditingController controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nhập Mã Sự Kiện'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: 'VD: evt-1'),
          autofocus: true,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
          ElevatedButton(
            onPressed: () {
              if (controller.text == eventId) {
                Navigator.pop(ctx);
                _submitCheckIn(eventId);
              } else {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Mã không hợp lệ!'), backgroundColor: Colors.red));
              }
            },
            child: const Text('Xác nhận'),
          ),
        ],
      ),
    );
  }

  Future<void> _submitCheckIn(String eventId) async {
    setState(() => _isCheckingIn = true);

    try {
      final response = await http.post(
        Uri.parse('$_apiUrl/checkin'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'event_id': eventId}),
      );
      
      final data = json.decode(response.body);
      
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(data['message'] ?? 'Thành công'),
          backgroundColor: data['success'] ? Colors.green : Colors.red,
          duration: const Duration(seconds: 3),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi kết nối mạng'), backgroundColor: Colors.red),
      );
    } finally {
      setState(() => _isCheckingIn = false);
    }
  }

  String _formatDate(String isoStr) {
    final dt = DateTime.parse(isoStr).toLocal();
    return '${dt.day}/${dt.month}/${dt.year} - ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Campus Life & Sự Kiện', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      body: Container(
        color: Colors.grey[100],
        padding: const EdgeInsets.all(16.0),
        child: _isLoading 
          ? const Center(child: CircularProgressIndicator())
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Sự kiện sắp diễn ra', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 15),
                Expanded(
                  child: ListView.builder(
                    itemCount: _events.length,
                    itemBuilder: (ctx, i) {
                      final evt = _events[i];
                      return Card(
                        color: Colors.white,
                        margin: const EdgeInsets.only(bottom: 16),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(evt['organizer'] ?? 'Chưa rõ ban tổ chức', style: const TextStyle(color: Colors.deepPurple, fontWeight: FontWeight.bold)),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(color: Colors.amber[100], borderRadius: BorderRadius.circular(10)),
                                    child: const Text('+5 ĐRL', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold)),
                                  )
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(evt['title'] ?? 'Sự kiện chưa có tên', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Icon(Icons.access_time, size: 16, color: Colors.grey),
                                  const SizedBox(width: 5),
                                  Text(evt['start_time'] != null ? _formatDate(evt['start_time']) : 'Chưa xếp lịch', style: const TextStyle(color: Colors.grey)),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  const Icon(Icons.location_on, size: 16, color: Colors.grey),
                                  const SizedBox(width: 5),
                                  Text(evt['location'] ?? 'Chưa cập nhật địa điểm', style: const TextStyle(color: Colors.grey)),
                                ],
                              ),
                              const SizedBox(height: 15),
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.black,
                                    foregroundColor: Colors.white,
                                  ),
                                  icon: _isCheckingIn ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Icon(Icons.qr_code_scanner),
                                  label: const Text('Nhập Mã Điểm danh (Thay cho QR)'),
                                  onPressed: _isCheckingIn ? null : () => _showQRDialog(evt['id']),
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
      ),
    );
  }
}
