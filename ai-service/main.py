from datetime import datetime, time, timedelta
from hashlib import sha256
from statistics import mean
from typing import Dict, List, Optional

from fastapi import FastAPI
from pydantic import BaseModel, Field


app = FastAPI(title="CampusFlow AI Optimizer API")


class Event(BaseModel):
    id: str
    title: str
    start_time: str
    end_time: str
    type: str = "GENERAL"
    is_locked: bool = False


class OptimizationRequest(BaseModel):
    events: List[Event]
    duration_minutes: int = Field(default=60, ge=15, le=360)
    preferred_start_hour: int = Field(default=8, ge=5, le=23)
    preferred_end_hour: int = Field(default=22, ge=6, le=24)
    pinned_slot_ids: List[str] = []


class TaskInput(BaseModel):
    id: str
    title: str
    due_date: str
    difficulty: int = Field(default=3, ge=1, le=5)
    estimated_minutes: Optional[int] = Field(default=None, ge=15, le=2400)
    priority: str = "MEDIUM"


class StudyPlanRequest(BaseModel):
    tasks: List[TaskInput]
    events: List[Event] = []
    daily_capacity_minutes: int = Field(default=180, ge=30, le=720)
    session_minutes: int = Field(default=50, ge=15, le=180)


class Rating(BaseModel):
    slot_start: str
    slot_end: str
    rating: int = Field(ge=1, le=5)


class HabitLearningRequest(BaseModel):
    ratings: List[Rating]


class BurnoutRecord(BaseModel):
    user_id: str
    faculty: Optional[str] = None
    major: Optional[str] = None
    study_hours: float = 0
    work_hours: float = 0
    sleep_hours_avg: float = 7
    burnout_score: float = Field(default=0, ge=0, le=100)


class BurnoutReportRequest(BaseModel):
    records: List[BurnoutRecord]
    group_by: str = "faculty"
    min_group_size: int = Field(default=3, ge=2, le=100)
    salt: str = "campusflow"


def parse_time(iso_str: str) -> datetime:
    if iso_str.endswith("Z"):
        iso_str = iso_str[:-1] + "+00:00"
    return datetime.fromisoformat(iso_str).replace(tzinfo=None)


def overlap(a_start: datetime, a_end: datetime, b_start: datetime, b_end: datetime) -> bool:
    return a_start < b_end and b_start < a_end


def merge_busy_ranges(events: List[Event]) -> List[Dict[str, datetime]]:
    ranges = sorted(
        [{"start": parse_time(event.start_time), "end": parse_time(event.end_time)} for event in events],
        key=lambda item: item["start"],
    )
    merged: List[Dict[str, datetime]] = []
    for item in ranges:
        if not merged or item["start"] > merged[-1]["end"]:
            merged.append(item)
        elif item["end"] > merged[-1]["end"]:
            merged[-1]["end"] = item["end"]
    return merged


def slot_score(start: datetime, end: datetime, request: OptimizationRequest) -> float:
    midpoint_hour = start.hour + start.minute / 60
    duration_minutes = (end - start).total_seconds() / 60
    target_hour = (request.preferred_start_hour + request.preferred_end_hour) / 2
    preference_score = max(0, 100 - abs(midpoint_hour - target_hour) * 8)
    duration_score = min(25, (duration_minutes - request.duration_minutes) / 6)
    return round(preference_score + duration_score, 2)


def build_free_slots(request: OptimizationRequest) -> List[Dict]:
    if not request.events:
        base_date = datetime.now().date()
    else:
        base_date = parse_time(request.events[0].start_time).date()

    day_start = datetime.combine(base_date, time(request.preferred_start_hour, 0))
    day_end = datetime.combine(base_date, time(request.preferred_end_hour % 24, 0))
    if request.preferred_end_hour == 24:
        day_end = datetime.combine(base_date + timedelta(days=1), time(0, 0))

    free_slots = []
    current_time = day_start
    for busy in merge_busy_ranges(request.events):
        busy_start = max(busy["start"].replace(tzinfo=None), day_start)
        busy_end = min(busy["end"].replace(tzinfo=None), day_end)
        if busy_start > current_time:
            gap_minutes = int((busy_start - current_time).total_seconds() / 60)
            if gap_minutes >= request.duration_minutes:
                free_slots.append(
                    {
                        "id": f"slot-{current_time.strftime('%H%M')}-{busy_start.strftime('%H%M')}",
                        "start": current_time.isoformat(),
                        "end": busy_start.isoformat(),
                        "duration_minutes": gap_minutes,
                    }
                )
        current_time = max(current_time, busy_end)

    if day_end > current_time:
        gap_minutes = int((day_end - current_time).total_seconds() / 60)
        if gap_minutes >= request.duration_minutes:
            free_slots.append(
                {
                    "id": f"slot-{current_time.strftime('%H%M')}-{day_end.strftime('%H%M')}",
                    "start": current_time.isoformat(),
                    "end": day_end.isoformat(),
                    "duration_minutes": gap_minutes,
                }
            )

    locked_events = [event for event in request.events if event.is_locked or event.id in request.pinned_slot_ids]
    scored_slots = []
    for slot in free_slots:
        start = parse_time(slot["start"])
        end = parse_time(slot["end"])
        touches_lock = any(
            overlap(start, end, parse_time(event.start_time).replace(tzinfo=None), parse_time(event.end_time).replace(tzinfo=None))
            for event in locked_events
        )
        if not touches_lock:
            scored_slots.append(
                {
                    **slot,
                    "score": slot_score(start, end, request),
                    "reason": "Uu tien khung gio rong, tranh cac slot da lock/pin va gan thoi diem hoc tap phu hop.",
                }
            )

    return sorted(scored_slots, key=lambda item: item["score"], reverse=True)


@app.get("/")
def read_root():
    return {"status": "ok", "message": "CampusFlow AI Optimizer is running!"}


@app.post("/api/optimize/check-conflict")
def check_conflict(request: OptimizationRequest):
    events = sorted(request.events, key=lambda event: parse_time(event.start_time))
    conflicts = []
    for index in range(len(events) - 1):
        current_event = events[index]
        next_event = events[index + 1]
        current_end = parse_time(current_event.end_time)
        next_start = parse_time(next_event.start_time)
        if next_start < current_end:
            conflicts.append(
                {
                    "event_1": current_event.title,
                    "event_2": next_event.title,
                    "message": f"Canh bao: '{current_event.title}' bi trung thoi gian voi '{next_event.title}'",
                }
            )
    return {"conflicts": conflicts}


@app.post("/api/optimize/suggest-slots")
def suggest_slots(request: OptimizationRequest):
    return {"suggested_slots": build_free_slots(request)[:3]}


@app.post("/api/study-plan/allocate")
def allocate_study_time(request: StudyPlanRequest):
    base_request = OptimizationRequest(
        events=request.events,
        duration_minutes=request.session_minutes,
    )
    free_slots = build_free_slots(base_request)
    plans = []

    weighted_tasks = sorted(
        request.tasks,
        key=lambda task: (parse_time(task.due_date), -task.difficulty),
    )
    for task in weighted_tasks:
        due_date = parse_time(task.due_date)
        estimate = task.estimated_minutes or task.difficulty * 45
        if task.priority.upper() == "HIGH":
            estimate = int(estimate * 1.25)

        remaining = estimate
        sessions = []
        for slot in free_slots:
            if remaining <= 0:
                break
            slot_start = parse_time(slot["start"])
            if slot_start > due_date:
                continue
            minutes = min(request.session_minutes, remaining, slot["duration_minutes"])
            if minutes >= 15:
                sessions.append(
                    {
                        "start": slot_start.isoformat(),
                        "end": (slot_start + timedelta(minutes=minutes)).isoformat(),
                        "minutes": minutes,
                    }
                )
                remaining -= minutes

        plans.append(
            {
                "task_id": task.id,
                "title": task.title,
                "recommended_minutes": estimate,
                "allocated_minutes": estimate - remaining,
                "sessions": sessions,
                "risk": "HIGH" if remaining > 0 else "LOW",
            }
        )

    return {"study_plan": plans}


@app.post("/api/habits/learn")
def learn_user_habits(request: HabitLearningRequest):
    if not request.ratings:
        return {"preferred_hours": [], "message": "Chua co du lieu rating."}

    by_hour: Dict[int, List[int]] = {}
    for rating in request.ratings:
        hour = parse_time(rating.slot_start).hour
        by_hour.setdefault(hour, []).append(rating.rating)

    preferred_hours = [
        {"hour": hour, "average_rating": round(mean(values), 2), "samples": len(values)}
        for hour, values in by_hour.items()
        if mean(values) >= 4
    ]
    return {
        "preferred_hours": sorted(preferred_hours, key=lambda item: item["average_rating"], reverse=True),
        "model": "weighted-rating-baseline",
    }


@app.post("/api/reports/burnout/anonymize")
def anonymize_burnout_report(request: BurnoutReportRequest):
    groups: Dict[str, List[BurnoutRecord]] = {}
    for record in request.records:
        group_key = getattr(record, request.group_by, None) or "unknown"
        groups.setdefault(group_key, []).append(record)

    report = []
    for group_key, records in groups.items():
        if len(records) < request.min_group_size:
            continue
        scores = [record.burnout_score for record in records]
        anonymous_group_id = sha256(f"{request.salt}:{group_key}".encode("utf-8")).hexdigest()[:12]
        report.append(
            {
                "group_id": anonymous_group_id,
                "group_by": request.group_by,
                "sample_size": len(records),
                "burnout_rate": round(sum(score >= 70 for score in scores) / len(scores), 3),
                "average_burnout_score": round(mean(scores), 2),
                "average_sleep_hours": round(mean(record.sleep_hours_avg for record in records), 2),
            }
        )

    return {"anonymized_report": report, "privacy": f"k-anonymity min_group_size={request.min_group_size}"}
