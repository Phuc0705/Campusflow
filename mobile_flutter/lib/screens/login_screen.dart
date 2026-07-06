import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';

import '../main.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final LocalAuthentication auth = LocalAuthentication();
  String _status = 'CampusFlow - Zero Effort';
  bool _isAuthenticating = false;

  Future<void> _authenticate() async {
    setState(() {
      _isAuthenticating = true;
      _status = 'Đang xác thực...';
    });

    try {
      final isSupported = await auth.isDeviceSupported();
      final canCheckBiometrics = await auth.canCheckBiometrics;

      // === BẮT ĐẦU ĐOẠN CHEAT CODE "VƯỢT RÀO" CHO WEB ===
      if (!isSupported || !canCheckBiometrics) {
        if (!mounted) return;
        setState(() {
          _isAuthenticating = false;
          _status = 'Môi trường Web: Đăng nhập giả lập thành công!';
        });
        
        // Ép nhảy thẳng vào giao diện chính
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const MainNavigationScreen()),
        );
        return;
      }
      // === KẾT THÚC ĐOẠN CHEAT CODE ===

      final authenticated = await auth.authenticate(
        localizedReason: 'Quét vân tay/Face ID để đồng bộ lịch trình',
        biometricOnly: true,
        persistAcrossBackgrounding: true,
      );

      if (!mounted) return;

      if (authenticated) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const MainNavigationScreen()),
        );
      } else {
        setState(() {
          _isAuthenticating = false;
          _status = 'Đăng nhập thất bại. Vui lòng thử lại.';
        });
      }
    } catch (e) {
      // Đề phòng lỗi văng ra ở bước khác, vẫn ép vào thẳng app để test UI
      if (!mounted) return;
      setState(() {
        _isAuthenticating = false;
        _status = 'Môi trường Web: Đăng nhập giả lập thành công!';
      });
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const MainNavigationScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.school_rounded, size: 100, color: Colors.blue),
            const SizedBox(height: 20),
            const Text(
              'CampusFlow',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.blue,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              _status,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 50),
            ElevatedButton.icon(
              icon: const Icon(Icons.fingerprint, size: 30),
              label: Text(
                _isAuthenticating ? 'Đang đăng nhập...' : 'Đăng nhập nhanh',
                style: const TextStyle(fontSize: 18),
              ),
              onPressed: _isAuthenticating ? null : _authenticate,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: 30,
                  vertical: 15,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
