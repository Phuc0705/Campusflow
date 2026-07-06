import 'package:flutter/material.dart';
import 'event_screen.dart';
import 'task_screen.dart';

import 'package:supabase_flutter/supabase_flutter.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = Supabase.instance.client.auth.currentUser;
    final String fullName = user?.userMetadata?['full_name'] ?? 'Người dùng CampusFlow';

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(20.0),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text('Xin chào,\n$fullName 👋', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
              ),
              Container(
                decoration: BoxDecoration(
                  color: Colors.blue[50],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Tooltip(
                  message: 'Quản lý Deadline',
                  child: IconButton(
                    icon: const Icon(Icons.checklist, color: Colors.blueAccent, size: 28),
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => const TaskScreen()));
                    },
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 30),
          Card(
            color: Colors.white,
            elevation: 2,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Tổng quan Tuần này', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const Text('Mức độ căng thẳng: Bình thường', style: TextStyle(color: Colors.grey)),
                  const SizedBox(height: 15),
                  const Text('Giờ tự học: 12/20 giờ'),
                  const SizedBox(height: 5),
                  LinearProgressIndicator(value: 0.6, backgroundColor: Colors.grey[200], color: Colors.blue),
                  const SizedBox(height: 15),
                  const Text('Việc làm thêm: 8/15 giờ'),
                  const SizedBox(height: 5),
                  LinearProgressIndicator(value: 0.53, backgroundColor: Colors.grey[200], color: Colors.green),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 60,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blueAccent,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
              ),
              icon: const Icon(Icons.festival, size: 28),
              label: const Text('Khám phá Sự kiện Trường & CLB', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const EventScreen()),
                );
              },
            ),
          )
        ],
      ),
      )
    );
  }
}
