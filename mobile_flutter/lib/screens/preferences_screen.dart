import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:supabase_flutter/supabase_flutter.dart';

class PreferencesScreen extends StatefulWidget {
  const PreferencesScreen({super.key});

  @override
  State<PreferencesScreen> createState() => _PreferencesScreenState();
}

class _PreferencesScreenState extends State<PreferencesScreen> {
  bool _isLoading = true;
  bool _isSaving = false;
  final String _apiUrl = 'http://127.0.0.1:3000/api/preferences';

  TimeOfDay _sleepStart = const TimeOfDay(hour: 23, minute: 0);
  TimeOfDay _sleepEnd = const TimeOfDay(hour: 6, minute: 0);
  TimeOfDay _lunchStart = const TimeOfDay(hour: 12, minute: 0);
  TimeOfDay _lunchEnd = const TimeOfDay(hour: 13, minute: 0);
  double _commuteDuration = 30.0;

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
    _fetchPreferences();
  }

  Future<void> _fetchPreferences() async {
    try {
      final response = await http.get(Uri.parse(_apiUrl), headers: _getHeaders());
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] && data['data'] != null) {
          final prefs = data['data'];
          setState(() {
            _sleepStart = _parseTime(prefs['sleep_start_time']);
            _sleepEnd = _parseTime(prefs['sleep_end_time']);
            _lunchStart = _parseTime(prefs['lunch_start_time']);
            _lunchEnd = _parseTime(prefs['lunch_end_time']);
            _commuteDuration = (prefs['commute_duration_minutes'] ?? 30).toDouble();
            _isLoading = false;
          });
          return;
        }
      }
      setState(() => _isLoading = false);
    } catch (e) {
      debugPrint('Error fetching preferences: $e');
      setState(() => _isLoading = false);
    }
  }

  TimeOfDay _parseTime(String timeStr) {
    if (timeStr.isEmpty) return const TimeOfDay(hour: 0, minute: 0);
    final parts = timeStr.split(':');
    return TimeOfDay(hour: int.parse(parts[0]), minute: int.parse(parts[1]));
  }

  String _formatTime(TimeOfDay time) {
    return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}:00';
  }

  Future<void> _savePreferences() async {
    setState(() => _isSaving = true);
    try {
      final response = await http.post(
        Uri.parse(_apiUrl),
        headers: _getHeaders(),
        body: json.encode({
          'sleep_start_time': _formatTime(_sleepStart),
          'sleep_end_time': _formatTime(_sleepEnd),
          'lunch_start_time': _formatTime(_lunchStart),
          'lunch_end_time': _formatTime(_lunchEnd),
          'commute_duration_minutes': _commuteDuration.toInt(),
        }),
      );

      final data = json.decode(response.body);
      if (response.statusCode == 200 && data['success']) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Lưu cấu hình thành công!'), backgroundColor: Colors.green),
          );
          Navigator.pop(context);
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(data['message'] ?? 'Đã có lỗi xảy ra'), backgroundColor: Colors.redAccent),
          );
        }
      }
    } catch (e) {
      debugPrint('Error saving preferences: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Lỗi kết nối máy chủ'), backgroundColor: Colors.redAccent),
        );
      }
    } finally {
      setState(() => _isSaving = false);
    }
  }

  Future<void> _selectTime(BuildContext context, TimeOfDay initialTime, Function(TimeOfDay) onTimeSelected) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: initialTime,
      builder: (context, child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: true),
          child: child!,
        );
      },
    );
    if (picked != null && picked != initialTime) {
      onTimeSelected(picked);
    }
  }

  Widget _buildTimeRow(String label, TimeOfDay time, Function(TimeOfDay) onChanged) {
    return InkWell(
      onTap: () => _selectTime(context, time, onChanged),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.grey.shade300),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontSize: 16)),
            Text(
              '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.blueAccent),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cấu hình Khung giờ Sinh hoạt'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 1,
      ),
      backgroundColor: Colors.grey[50],
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'AI Optimizer sẽ dựa vào cấu hình này để không bao giờ xếp lịch học hay làm bài tập vào các khung giờ sinh hoạt cố định của bạn.',
                    style: TextStyle(color: Colors.grey, fontSize: 14),
                  ),
                  const SizedBox(height: 24),
                  
                  const Text('Khung giờ Ngủ', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.deepPurple)),
                  const SizedBox(height: 10),
                  _buildTimeRow('Bắt đầu ngủ (Ban đêm)', _sleepStart, (time) => setState(() => _sleepStart = time)),
                  const SizedBox(height: 8),
                  _buildTimeRow('Thức dậy (Buổi sáng)', _sleepEnd, (time) => setState(() => _sleepEnd = time)),
                  
                  const SizedBox(height: 24),
                  const Text('Khung giờ Nghỉ trưa', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.orange)),
                  const SizedBox(height: 10),
                  _buildTimeRow('Bắt đầu ăn trưa', _lunchStart, (time) => setState(() => _lunchStart = time)),
                  const SizedBox(height: 8),
                  _buildTimeRow('Kết thúc nghỉ trưa', _lunchEnd, (time) => setState(() => _lunchEnd = time)),
                  
                  const SizedBox(height: 24),
                  const Text('Thời gian Di chuyển (Commute)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.blue)),
                  const SizedBox(height: 8),
                  Text(
                    'Thời gian trung bình bạn cần để di chuyển từ nhà đến trường: ${_commuteDuration.toInt()} phút',
                    style: const TextStyle(color: Colors.grey, fontSize: 14),
                  ),
                  Slider(
                    value: _commuteDuration,
                    min: 0,
                    max: 120,
                    divisions: 12,
                    label: '${_commuteDuration.toInt()} phút',
                    activeColor: Colors.blueAccent,
                    onChanged: (val) => setState(() => _commuteDuration = val),
                  ),
                  
                  const SizedBox(height: 40),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blueAccent,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: _isSaving ? null : _savePreferences,
                      child: _isSaving 
                          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Text('Lưu cấu hình AI', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                  )
                ],
              ),
            ),
    );
  }
}
