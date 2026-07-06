require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function seed() {
  console.log("Seeding data...");
  const { data, error } = await supabase
    .from('events')
    .insert([
      { 
        title: 'Ngày hội Việc làm IT (Job Fair 2026)', 
        organizer: 'Khoa CNTT', 
        location: 'Hội trường A',
        start_time: new Date(new Date().getTime() + 86400000).toISOString(),
        end_time: new Date(new Date().getTime() + 86400000 * 2).toISOString(),
        description: 'Ngày hội tuyển dụng lớn nhất năm'
      },
      { 
        title: 'Seminar: AI in Software Engineering', 
        organizer: 'CLB Trí tuệ Nhân tạo', 
        location: 'Phòng Hội thảo C2',
        start_time: new Date(new Date().getTime() + 86400000 * 3).toISOString(),
        end_time: new Date(new Date().getTime() + 86400000 * 4).toISOString(),
        description: 'Hội thảo chuyên đề AI'
      }
    ]).select();

  if (error) {
    console.error("Error seeding:", error.message);
  } else {
    console.log("Seeded successfully:", data.length, "events");
  }
}

seed();
