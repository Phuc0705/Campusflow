import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<dynamic> _checkins = [];
  List<dynamic> _deadlines = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() => _loading = true);
    try {
      final checkinRes = await http.get(Uri.parse('http://10.0.2.2:3000/api/events'));
      final parsedCheckins = jsonDecode(checkinRes.body);
      final deadlineRes = await http.post(
        Uri.parse('http://10.0.2.2:3000/api/notifications/deadlines/parse'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'message': 'Zalo: Deadline môn PM nộp báo cáo trước 20h tối nay',
          'userId': 'demo-user',
        }),
      );
      final parsedDeadline = jsonDecode(deadlineRes.body);
      setState(() {
        _checkins = parsedCheckins['data'] ?? [];
        _deadlines = [parsedDeadline['data'] ?? {}];
        _loading = false;
      });
    } catch (error) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lịch sử Check-in & Deadline')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                const Text('Check-in gần đây', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                ..._checkins.map((item) => Card(child: ListTile(title: Text(item['title'] ?? 'Sự kiện'), subtitle: Text(item['location'] ?? '---')))).toList(),
                const SizedBox(height: 20),
                const Text('Deadline phân tích', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                ..._deadlines.map((item) => Card(child: ListTile(title: Text(item['title'] ?? 'Deadline'), subtitle: Text(item['summary'] ?? '---')))).toList(),
              ],
            ),
    );
  }
}
