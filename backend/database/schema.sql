-- User Profile Extension (extends Supabase Auth)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    university TEXT,
    major TEXT,
    cohort TEXT, -- Niên khóa
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Academic Schedule (Lịch học/Lịch thi)
CREATE TABLE schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    course_code TEXT NOT NULL,
    course_name TEXT NOT NULL,
    room TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT CHECK (type IN ('LECTURE', 'EXAM', 'LAB')),
    color_code TEXT DEFAULT '#3b82f6',
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tasks & Deadlines
CREATE TABLE tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    course_code TEXT,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    priority TEXT CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')) DEFAULT 'MEDIUM',
    status TEXT CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')) DEFAULT 'TODO',
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Campus Events (Sự kiện trường/CLB)
CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    organizer TEXT,
    location TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Event Registrations (Đăng ký sự kiện)
CREATE TABLE event_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(event_id, user_id)
);

-- Bảng Quản lý Danh mục Môn học (CF-36)
CREATE TABLE courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_code TEXT UNIQUE NOT NULL,
    course_name TEXT NOT NULL,
    credits INTEGER DEFAULT 3,
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Bảng Cấu hình Thông báo (CF-33)
CREATE TABLE notification_configs (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
    email_enabled BOOLEAN DEFAULT true,
    app_enabled BOOLEAN DEFAULT true,
    telegram_enabled BOOLEAN DEFAULT false,
    telegram_chat_id TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Bảng Quản lý Hạn mức Storage (CF-39)
CREATE TABLE storage_quotas (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
    used_bytes BIGINT DEFAULT 0,
    limit_bytes BIGINT DEFAULT 52428800, -- Default 50MB
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Row Level Security (RLS) Policies
-- Kích hoạt RLS cho toàn bộ các bảng (CF-102)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_quotas ENABLE ROW LEVEL SECURITY;

-- Policies: Chỉ cho phép người dùng đọc/ghi dữ liệu CỦA RIÊNG HỌ (Theo User ID)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own schedules" ON schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own schedules" ON schedules FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);

-- Sự kiện public cho mọi người đọc, nhưng chỉ Admin tạo
CREATE POLICY "Events are viewable by everyone" ON events FOR SELECT USING (true);
-- CREATE POLICY "Admin can insert events" ON events FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role='admin')); 

CREATE POLICY "Users can checkin" ON event_registrations FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Courses are viewable by everyone" ON courses FOR SELECT USING (true);

CREATE POLICY "Users can manage own notification config" ON notification_configs FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quota" ON storage_quotas FOR SELECT USING (auth.uid() = user_id);
