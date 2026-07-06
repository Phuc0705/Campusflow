import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:supabase_flutter/supabase_flutter.dart';

class TaskScreen extends StatefulWidget {
  const TaskScreen({super.key});

  @override
  State<TaskScreen> createState() => _TaskScreenState();
}

class _TaskScreenState extends State<TaskScreen> {
  List<dynamic> _tasks = [];
  List<dynamic> _schedules = [];
  bool _isLoading = true;
  final String _apiUrl = 'http://127.0.0.1:3000/api/tasks';
  final String _schedulesUrl = 'http://127.0.0.1:3000/api/schedules';

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
    _fetchTasks();
    _fetchSchedules();
  }

  Future<void> _fetchSchedules() async {
    try {
      final response = await http.get(Uri.parse(_schedulesUrl), headers: _getHeaders());
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          setState(() {
            _schedules = data['data'];
          });
        }
      }
    } catch (e) {
      debugPrint('Error fetching schedules: $e');
    }
  }

  Future<void> _fetchTasks() async {
    try {
      final response = await http.get(Uri.parse(_apiUrl), headers: _getHeaders());
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          setState(() {
            _tasks = data['data'];
            _isLoading = false;
          });
        } else {
          _showErrorSnackBar(data['message'] ?? 'Lỗi tải danh sách');
          setState(() => _isLoading = false);
        }
      } else {
        _showErrorSnackBar('Lỗi xác thực (Mã ${response.statusCode})');
        setState(() => _isLoading = false);
      }
    } catch (e) {
      debugPrint('Error fetching tasks: $e');
      _showErrorSnackBar('Lỗi kết nối máy chủ');
      setState(() => _isLoading = false);
    }
  }

  void _showErrorSnackBar(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.redAccent,
        duration: const Duration(seconds: 4),
      ),
    );
  }

  Future<void> _addTask(String title, String courseCode, String priority) async {
    try {
      final response = await http.post(
        Uri.parse(_apiUrl),
        headers: _getHeaders(),
        body: json.encode({
          'title': title,
          'course_code': courseCode,
          'priority': priority
        }),
      );
      final data = json.decode(response.body);
      if (response.statusCode == 200 && data['success']) {
        _fetchTasks();
      } else {
        _showErrorSnackBar(data['message'] ?? 'Không thể lưu lên Supabase');
      }
    } catch (e) {
      debugPrint('Error adding task: $e');
      _showErrorSnackBar('Lỗi kết nối khi lưu Task');
    }
  }

  Future<void> _deleteTask(String id) async {
    try {
      await http.delete(Uri.parse('$_apiUrl/$id'), headers: _getHeaders());
      setState(() {
        _tasks.removeWhere((t) => t['id'] == id);
      });
    } catch (e) {
      debugPrint('Error deleting task: $e');
    }
  }

  void _showAddTaskDialog() {
    final TextEditingController titleController = TextEditingController();
    String selectedPriority = 'MEDIUM';
    String selectedCourse = 'Cá nhân';

    // Tạo danh sách các môn học duy nhất từ lịch học
    final Set<String> courseCodes = {'Cá nhân'};
    for (var s in _schedules) {
      if (s['course_code'] != null) {
        courseCodes.add(s['course_code'].toString());
      }
    }

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) {
          return AlertDialog(
            title: const Text('Thêm Bài tập/Deadline', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: titleController,
                    decoration: InputDecoration(
                      labelText: 'Tên công việc',
                      hintText: 'VD: Làm báo cáo nhóm',
                      prefixIcon: const Icon(Icons.task_alt),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    autofocus: true,
                  ),
                  const SizedBox(height: 15),
                  DropdownButtonFormField<String>(
                    value: selectedCourse,
                    decoration: InputDecoration(
                      labelText: 'Thuộc môn học',
                      prefixIcon: const Icon(Icons.book),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    items: courseCodes.map((code) {
                      return DropdownMenuItem(value: code, child: Text(code));
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setDialogState(() => selectedCourse = val);
                      }
                    },
                  ),
                  const SizedBox(height: 15),
                  DropdownButtonFormField<String>(
                    value: selectedPriority,
                    decoration: InputDecoration(
                      labelText: 'Độ ưu tiên',
                      prefixIcon: const Icon(Icons.flag),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'HIGH', child: Text('Cao (Urgent)', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold))),
                      DropdownMenuItem(value: 'MEDIUM', child: Text('Trung bình', style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold))),
                      DropdownMenuItem(value: 'LOW', child: Text('Thấp', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold))),
                    ],
                    onChanged: (val) {
                      if (val != null) {
                        setDialogState(() => selectedPriority = val);
                      }
                    },
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy', style: TextStyle(color: Colors.grey))),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blueAccent, 
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: () {
                  if (titleController.text.isNotEmpty) {
                    _addTask(
                      titleController.text.trim(),
                      selectedCourse,
                      selectedPriority,
                    );
                    Navigator.pop(ctx);
                  }
                },
                child: const Text('Thêm Task', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          );
        }
      ),
    );
  }

  void _toggleTask(int index) {
    setState(() {
      _tasks[index]['status'] = _tasks[index]['status'] == 'DONE' ? 'TODO' : 'DONE';
    });
    // Call PATCH /api/tasks/:id
    http.patch(
      Uri.parse('$_apiUrl/${_tasks[index]['id']}'),
      headers: _getHeaders(),
      body: json.encode({'status': _tasks[index]['status']}),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Quản lý Deadline', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 1,
      ),
      body: Container(
        color: Colors.grey[100],
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _tasks.length,
                itemBuilder: (ctx, i) {
                  final task = _tasks[i];
                  final isHighPriority = task['priority'] == 'HIGH';
                  final isCompleted = task['status'] == 'DONE';
                  
                  return Dismissible(
                    key: Key(task['id'].toString()),
                    direction: DismissDirection.endToStart,
                    background: Container(
                      alignment: Alignment.centerRight,
                      padding: const EdgeInsets.only(right: 20),
                      color: Colors.red,
                      child: const Icon(Icons.delete, color: Colors.white),
                    ),
                    onDismissed: (direction) => _deleteTask(task['id'].toString()),
                    child: Card(
                      color: Colors.white,
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: BorderSide(
                          color: isHighPriority && !isCompleted ? Colors.redAccent : Colors.transparent,
                          width: 1.5,
                        ),
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        leading: Checkbox(
                          value: isCompleted,
                          activeColor: Colors.green,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                          onChanged: (val) => _toggleTask(i),
                        ),
                        title: Text(
                          task['title'] ?? 'Không tên',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            decoration: isCompleted ? TextDecoration.lineThrough : null,
                            color: isCompleted ? Colors.grey : Colors.black87,
                          ),
                        ),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 6.0),
                          child: Row(
                            children: [
                              Icon(Icons.event_note, size: 14, color: Colors.grey[600]),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  task['course_code'] ?? 'Chưa phân loại',
                                  style: TextStyle(color: Colors.grey[600]),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              if (isHighPriority)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.red[50],
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text('Urgent', style: TextStyle(color: Colors.red, fontSize: 10, fontWeight: FontWeight.bold)),
                                )
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddTaskDialog,
        backgroundColor: Colors.blueAccent,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}
