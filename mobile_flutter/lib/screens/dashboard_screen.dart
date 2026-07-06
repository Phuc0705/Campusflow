import 'package:flutter/material.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _task1Done = false;
  bool _task2Done = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tổng quan CampusFlow')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Hôm nay của bạn thế nào?', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            // Widget Check Task nhanh
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.checklist, color: Colors.blue),
                        SizedBox(width: 8),
                        Text('Việc cần làm khẩn cấp', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const Divider(),
                    CheckboxListTile(
                      title: Text('Nộp Code Sprint 1', style: TextStyle(decoration: _task1Done ? TextDecoration.lineThrough : null)),
                      value: _task1Done,
                      activeColor: Colors.green,
                      onChanged: (bool? value) => setState(() => _task1Done = value!),
                    ),
                    CheckboxListTile(
                      title: Text('Họp nhóm đồ án', style: TextStyle(decoration: _task2Done ? TextDecoration.lineThrough : null)),
                      value: _task2Done,
                      activeColor: Colors.green,
                      onChanged: (bool? value) => setState(() => _task2Done = value!),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}