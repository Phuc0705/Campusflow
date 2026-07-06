from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

app = FastAPI(title="CampusFlow AI Optimizer API")

class Event(BaseModel):
    id: str
    title: str
    start_time: str
    end_time: str
    type: str

class OptimizationRequest(BaseModel):
    events: List[Event]
    duration_minutes: Optional[int] = 60 # Thời lượng cần tìm (ví dụ 60 phút tự học)

def parse_time(iso_str: str) -> datetime:
    # Xử lý chuỗi thời gian đơn giản
    # Trong môi trường thực tế sẽ dùng format chuẩn của ISO
    if 'Z' in iso_str:
        iso_str = iso_str.replace('Z', '')
    return datetime.fromisoformat(iso_str)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "CampusFlow AI Optimizer is running!"}

@app.post("/api/optimize/check-conflict")
def check_conflict(request: OptimizationRequest):
    events = sorted(request.events, key=lambda e: parse_time(e.start_time))
    conflicts = []
    
    # Duyệt qua các event đã sort để tìm giao cắt (overlap)
    for i in range(len(events) - 1):
        current_event = events[i]
        next_event = events[i + 1]
        
        current_end = parse_time(current_event.end_time)
        next_start = parse_time(next_event.start_time)
        
        if next_start < current_end:
            conflicts.append({
                "event_1": current_event.title,
                "event_2": next_event.title,
                "message": f"Cảnh báo: '{current_event.title}' bị trùng thời gian với '{next_event.title}'"
            })
            
    return {"conflicts": conflicts}

@app.post("/api/optimize/suggest-slots")
def suggest_slots(request: OptimizationRequest):
    # Lấy ngày của event đầu tiên làm gốc (hoặc ngày hiện tại)
    if not request.events:
        return {"suggested_slots": []}
        
    base_date = parse_time(request.events[0].start_time).date()
    
    # Khung giờ sinh hoạt: 08:00 đến 22:00
    day_start = datetime.combine(base_date, datetime.min.time()).replace(hour=8, minute=0)
    day_end = datetime.combine(base_date, datetime.min.time()).replace(hour=22, minute=0)
    
    events = sorted(request.events, key=lambda e: parse_time(e.start_time))
    
    free_slots = []
    current_time = day_start
    
    for event in events:
        event_start = parse_time(event.start_time)
        event_end = parse_time(event.end_time)
        
        # Nếu có khoảng trống giữa current_time và event_start
        if event_start > current_time:
            gap = (event_start - current_time).total_seconds() / 60
            if gap >= request.duration_minutes:
                free_slots.append({
                    "start": current_time.isoformat(),
                    "end": event_start.isoformat(),
                    "duration_minutes": gap,
                    "message": f"Giờ vàng: Bạn có {int(gap)} phút rảnh trước khi bắt đầu '{event.title}'"
                })
        
        # Cập nhật current_time
        if event_end > current_time:
            current_time = event_end
            
    # Kiểm tra khoảng trống cuối ngày
    if day_end > current_time:
        gap = (day_end - current_time).total_seconds() / 60
        if gap >= request.duration_minutes:
            free_slots.append({
                "start": current_time.isoformat(),
                "end": day_end.isoformat(),
                "duration_minutes": gap,
                "message": f"Giờ vàng cuối ngày: Rảnh {int(gap)} phút trước giờ đi ngủ."
            })
            
    return {"suggested_slots": free_slots}
