import 'package:flutter/material.dart';
import 'dart:async';

class FocusScreen extends StatefulWidget {
  const FocusScreen({super.key});

  @override
  State<FocusScreen> createState() => _FocusScreenState();
}

class _FocusScreenState extends State<FocusScreen> {
  static const int _pomodoroDuration = 25 * 60; // 25 phút
  int _secondsRemaining = _pomodoroDuration;
  Timer? _timer;
  bool _isRunning = false;

  void _startTimer() {
    setState(() => _isRunning = true);
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_secondsRemaining > 0) {
          _secondsRemaining--;
        } else {
          _stopTimer();
          _showCompletionDialog();
        }
      });
    });
  }

  void _stopTimer() {
    _timer?.cancel();
    setState(() => _isRunning = false);
  }

  void _resetTimer() {
    _stopTimer();
    setState(() => _secondsRemaining = _pomodoroDuration);
  }

  void _showCompletionDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Chúc mừng! 🎉'),
        content: const Text('Bạn đã hoàn thành 25 phút Deep Work. Hãy nghỉ ngơi 5 phút nhé!'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              _resetTimer();
            },
            child: const Text('Tiếp tục'),
          ),
        ],
      ),
    );
  }

  String get _timerText {
    int minutes = _secondsRemaining ~/ 60;
    int seconds = _secondsRemaining % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.grey[900], // Dark mode cho Focus
      width: double.infinity,
      child: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SizedBox(height: 50),
            const Text('🔥 CHẾ ĐỘ TẬP TRUNG', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: 2)),
            const SizedBox(height: 10),
            const Text('Tất cả thông báo đã được làm im lặng.', style: TextStyle(color: Colors.grey, fontSize: 14)),
            const SizedBox(height: 50),
            Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  width: 250,
                  height: 250,
                  child: CircularProgressIndicator(
                    value: _secondsRemaining / _pomodoroDuration,
                    strokeWidth: 12,
                    backgroundColor: Colors.grey[800],
                    color: Colors.deepOrangeAccent,
                  ),
                ),
                Text(
                  _timerText,
                  style: const TextStyle(fontSize: 60, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ],
            ),
            const SizedBox(height: 60),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _isRunning ? Colors.grey[700] : Colors.deepOrangeAccent,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                  ),
                  onPressed: _isRunning ? _stopTimer : _startTimer,
                  child: Text(_isRunning ? 'Tạm Dừng' : 'Bắt Đầu', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(width: 20),
                IconButton(
                  icon: const Icon(Icons.refresh, color: Colors.white, size: 32),
                  onPressed: _resetTimer,
                )
              ],
            ),
            const SizedBox(height: 50),
          ],
        ),
      ),
    );
  }
}
