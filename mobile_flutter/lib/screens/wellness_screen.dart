import 'package:flutter/material.dart';

class WellnessScreen extends StatefulWidget {
  const WellnessScreen({super.key});

  @override
  State<WellnessScreen> createState() => _WellnessScreenState();
}

class _WellnessScreenState extends State<WellnessScreen> {
  String _selectedMood = '';

  Widget _buildMoodIcon(String emoji, String label) {
    bool isSelected = _selectedMood == label;
    return GestureDetector(
      onTap: () => setState(() => _selectedMood = label),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: isSelected ? Colors.blue.withValues(alpha: 0.2) : Colors.transparent,
              shape: BoxShape.circle,
              border: Border.all(color: isSelected ? Colors.blue : Colors.transparent, width: 2),
            ),
            child: Text(emoji, style: const TextStyle(fontSize: 40)),
          ),
          const SizedBox(height: 5),
          Text(label, style: TextStyle(fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Theo Dõi Sức Khỏe')),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Hôm nay bạn cảm thấy thế nào?', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 30),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildMoodIcon('😭', 'Tệ'),
                _buildMoodIcon('😐', 'Bình thường'),
                _buildMoodIcon('😊', 'Vui vẻ'),
                _buildMoodIcon('🤩', 'Tuyệt vời'),
              ],
            ),
            const SizedBox(height: 40),
            if (_selectedMood.isNotEmpty)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.green.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle, color: Colors.green),
                    const SizedBox(width: 10),
                    Expanded(child: Text('Đã ghi nhận tâm trạng "$_selectedMood" của bạn hôm nay. Cố gắng giữ sức khỏe nhé!', style: const TextStyle(color: Colors.green))),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
