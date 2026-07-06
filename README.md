# 🎓 CampusFlow: Student Life Management System

![CampusFlow Banner](https://via.placeholder.com/1200x400?text=CampusFlow+-+Student+Life+Manager)

CampusFlow là một ứng dụng quản lý toàn diện dành riêng cho sinh viên Việt Nam, được thiết kế để giải quyết bài toán "ngộp" thông tin (Deadline dồn dập, trùng lịch học, kiệt sức). Hệ thống ứng dụng kiến trúc Microservices kết hợp với Trí tuệ Nhân tạo (AI) để tối ưu hóa thời khóa biểu và cảnh báo tâm lý học đường.

## 🌟 Tính năng nổi bật (Core Features)

1. **Smart Calendar & AI Optimizer:** Tự động đồng bộ lịch học và dùng AI (FastAPI) để phát hiện trùng lịch, tự động xếp lịch tự học vào các khe thời gian trống.
2. **Task & Deadline Management:** Vuốt để xóa, Checkbox hoàn thành, và phân loại mức độ khẩn cấp (Urgent). Lưu trữ đám mây Real-time.
3. **Campus Life Hub:** Nơi kết nối với các CLB, sự kiện trường và hệ thống quét QR điểm danh cộng điểm rèn luyện (ĐRL).
4. **Wellness & Focus Mode:** Tích hợp đồng hồ Pomodoro tập trung và thuật toán tính toán điểm kiệt sức (Burnout Score) để bảo vệ sức khỏe tâm lý sinh viên.

## 🛠 Tech Stack (Kiến trúc Hệ thống)

Dự án áp dụng mô hình Client - Server - Cloud Database chuyên nghiệp:
- **Mobile App:** Flutter / Dart (Đa nền tảng iOS & Android).
- **Web Admin:** React.js / Vite / TypeScript (Dành cho Quản trị viên nhà trường).
- **Backend API:** Node.js / Express (Gateway xử lý nghiệp vụ).
- **AI Service:** Python / FastAPI (Chịu tải thuật toán phân tích Lịch).
- **Database:** Supabase (PostgreSQL) kết nối qua thư viện `@supabase/supabase-js`.

## 🚀 Hướng dẫn Cài đặt & Chạy dự án (Local Development)

Yêu cầu máy tính đã cài đặt: `Node.js`, `Flutter SDK`, `Python 3.x`.

### Bước 1: Khởi động Backend (Node.js)
```bash
cd backend
npm install
# Tạo file .env và nhập SUPABASE_URL, SUPABASE_KEY
npm run dev
```
*(Server sẽ chạy tại `http://127.0.0.1:3000`)*

### Bước 2: Khởi động AI Service (Python)
```bash
cd ai-service
pip install -r requirements.txt
python -m uvicorn main:app --reload
```
*(Server AI sẽ chạy tại `http://127.0.0.1:8000`)*

### Bước 3: Chạy Web Admin (React)
```bash
cd admin-web
npm install
npm run dev
```

### Bước 4: Chạy Mobile App (Flutter)
```bash
cd mobile_flutter
flutter run -d chrome
```

## 📜 Quy trình Quản lý (Software Engineering)
Dự án được quản lý theo mô hình **Agile Scrum (Sprint 2 tuần)**, áp dụng các tài liệu chuẩn kỹ nghệ phần mềm:
- PA02, PA03: Vấn đề & Giải pháp
- PA05: Product Backlog & Story Points
- PA06: Fixed-Date Release Plan
- PA07: Risk Management (Đã xử lý thành công rủi ro R01 và R02)

---
*Dự án Đồ án Môn học Quản lý Dự án Phần mềm - Nhóm 5.*
