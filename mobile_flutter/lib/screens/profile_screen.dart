import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  
  Future<void> _signOut(BuildContext context) async {
    await Supabase.instance.client.auth.signOut();
    if (!context.mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => const LoginScreen()),
    );
  }

  Future<void> _showEditProfileDialog(String currentMajor, String currentYear) async {
    final majorController = TextEditingController(text: currentMajor != 'Đang cập nhật...' ? currentMajor : '');
    final yearController = TextEditingController(text: currentYear != 'Đang cập nhật...' ? currentYear : '');
    
    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cập nhật thông tin', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: majorController,
              decoration: const InputDecoration(
                labelText: 'Chuyên ngành', 
                hintText: 'VD: Kỹ thuật Phần mềm',
                prefixIcon: Icon(Icons.school),
              ),
            ),
            const SizedBox(height: 15),
            TextField(
              controller: yearController,
              decoration: const InputDecoration(
                labelText: 'Niên khóa', 
                hintText: 'VD: K66',
                prefixIcon: Icon(Icons.badge),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy', style: TextStyle(color: Colors.grey))),
          ElevatedButton(
            onPressed: () async {
              // Update user metadata in Supabase
              await Supabase.instance.client.auth.updateUser(
                UserAttributes(
                  data: {
                    'major': majorController.text.trim(),
                    'academic_year': yearController.text.trim(),
                  },
                ),
              );
              if (ctx.mounted) {
                Navigator.pop(ctx);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blueAccent,
              foregroundColor: Colors.white,
            ),
            child: const Text('Lưu'),
          ),
        ],
      ),
    );
    // Refresh UI to show updated metadata
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final user = Supabase.instance.client.auth.currentUser;
    final String fullName = user?.userMetadata?['full_name'] ?? 'Người dùng CampusFlow';
    final String email = user?.email ?? 'Chưa cập nhật email';
    final String avatarUrl = user?.userMetadata?['avatar_url'] ?? '';
    final String major = user?.userMetadata?['major'] ?? 'Đang cập nhật...';
    final String academicYear = user?.userMetadata?['academic_year'] ?? 'Đang cập nhật...';

    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 40),
            // Avatar
            Center(
              child: CircleAvatar(
                radius: 60,
                backgroundColor: Colors.blueAccent,
                backgroundImage: avatarUrl.isNotEmpty ? NetworkImage(avatarUrl) : null,
                child: avatarUrl.isEmpty
                    ? const Icon(Icons.person, size: 60, color: Colors.white)
                    : null,
              ),
            ),
            const SizedBox(height: 20),
            // Tên và Email
            Text(
              fullName,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              email,
              style: const TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 40),
            // Thẻ thông tin sinh viên
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Card(
                color: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    children: [
                      ListTile(
                        leading: const Icon(Icons.school, color: Colors.blue),
                        title: const Text('Chuyên ngành'),
                        subtitle: Text(major),
                      ),
                      const Divider(),
                      ListTile(
                        leading: const Icon(Icons.badge, color: Colors.orange),
                        title: const Text('Khóa học / Niên khóa'),
                        subtitle: Text(academicYear),
                      ),
                      const SizedBox(height: 10),
                      TextButton.icon(
                        onPressed: () => _showEditProfileDialog(major, academicYear),
                        icon: const Icon(Icons.edit, size: 18),
                        label: const Text('Chỉnh sửa thông tin', style: TextStyle(fontWeight: FontWeight.bold)),
                        style: TextButton.styleFrom(foregroundColor: Colors.blueAccent),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 40),
            // Nút đăng xuất
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.redAccent,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                  ),
                  icon: const Icon(Icons.logout),
                  label: const Text(
                    'Đăng xuất',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  onPressed: () => _signOut(context),
                ),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
