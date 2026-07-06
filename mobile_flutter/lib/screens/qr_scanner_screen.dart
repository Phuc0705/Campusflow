import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:mobile_scanner/mobile_scanner.dart';

class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  bool _isSubmitting = false;
  String _status = 'Quét mã QR để điểm danh';

  Future<void> _submitCheckin(String code) async {
    if (_isSubmitting) return;
    setState(() {
      _isSubmitting = true;
      _status = 'Đang gửi check-in...';
    });

    try {
      final response = await http.post(
        Uri.parse('http://10.0.2.2:3000/api/events/checkin'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'event_id': code,
          'userId': 'demo-user',
          'latitude': 21.0285,
          'longitude': 105.8542,
          'eventLatitude': 21.0285,
          'eventLongitude': 105.8542,
        }),
      );

      final data = jsonDecode(response.body);
      setState(() {
        _status = data['message'] ?? 'Check-in thành công';
      });
    } catch (error) {
      setState(() {
        _status = 'Lỗi kết nối backend: $error';
      });
    } finally {
      setState(() {
        _isSubmitting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('QR Check-in')),
      body: Column(
        children: [
          Expanded(
            child: MobileScanner(
              onDetect: (capture) {
                final List<Barcode> barcodes = capture.barcodes;
                for (final barcode in barcodes) {
                  final String? code = barcode.rawValue;
                  if (code != null && code.isNotEmpty) {
                    _submitCheckin(code);
                    break;
                  }
                }
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Text(_status, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                if (_isSubmitting) const CircularProgressIndicator(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
