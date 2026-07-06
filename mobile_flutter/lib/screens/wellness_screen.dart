import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class WellnessScreen extends StatefulWidget {
  const WellnessScreen({super.key});

  @override
  State<WellnessScreen> createState() => _WellnessScreenState();
}

class _WellnessScreenState extends State<WellnessScreen> {
  Map<String, dynamic>? _wellnessData;
  bool _isLoading = true;
  final String _apiUrl = 'http://192.168.11.236:3000/api/wellness';

  @override
  void initState() {
    super.initState();
    _fetchWellness();
  }

  Future<void> _fetchWellness() async {
    try {
      final response = await http.get(Uri.parse(_apiUrl));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          setState(() {
            _wellnessData = data['data'];
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      debugPrint('Error: $e');
      setState(() => _isLoading = false);
    }
  }

  Color _hexToColor(String hexString) {
    final buffer = StringBuffer();
    if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
    buffer.write(hexString.replaceFirst('#', ''));
    return Color(int.parse(buffer.toString(), radix: 16));
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_wellnessData == null) {
      return const Center(child: Text('Không thể lấy dữ liệu Sức khỏe.'));
    }

    final score = _wellnessData!['burnout_score'];
    final color = _hexToColor(_wellnessData!['color']);

    return Container(
      color: Colors.grey[100],
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Báo cáo Tinh thần & Sức khỏe', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          
          Card(
            color: Colors.white,
            elevation: 3,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                children: [
                  const Text('Chỉ số Kiệt sức (Burnout Score)', style: TextStyle(fontSize: 16, color: Colors.grey)),
                  const SizedBox(height: 10),
                  Text('$score%', style: TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: color)),
                  const SizedBox(height: 10),
                  LinearProgressIndicator(
                    value: score / 100,
                    minHeight: 10,
                    backgroundColor: Colors.grey[200],
                    color: color,
                  ),
                  const SizedBox(height: 20),
                  Text(_wellnessData!['status'], style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
                  const SizedBox(height: 10),
                  Text(
                    _wellnessData!['message'],
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 14, color: Colors.black87),
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 20),
          const Text('Thống kê Tuần', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          
          Row(
            children: [
              Expanded(child: _buildStatCard('Giờ tự học', '${_wellnessData!['study_hours']}h', Icons.menu_book, Colors.blue)),
              const SizedBox(width: 10),
              Expanded(child: _buildStatCard('Làm thêm', '${_wellnessData!['work_hours']}h', Icons.work, Colors.orange)),
              const SizedBox(width: 10),
              Expanded(child: _buildStatCard('Ngủ/đêm', '${_wellnessData!['sleep_hours_avg']}h', Icons.bedtime, Colors.indigo)),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16.0),
        child: Column(
          children: [
            Icon(icon, color: color, size: 30),
            const SizedBox(height: 8),
            Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}
