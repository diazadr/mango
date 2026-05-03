# Assessment & Mentoring API Flow Example

This document describes how to use the REST API for the assessment and mentoring module.

## 1. Assessment Flow

### Step 1: Create a new assessment session
**POST** `/api/v1/assessments`
```json
{
  "umkm_id": 1
}
```
**Response:** `201 Created` with the assessment object (e.g., `id: 1`).

### Step 2: Submit answers
**POST** `/api/v1/assessments/1/answers`
```json
{
  "answers": [
    { "question_id": 1, "value": "Sudah ada NIB", "score": 4 },
    { "question_id": 2, "value": "Ada struktur organisasi", "score": 3 },
    { "question_id": 3, "value": "Belum ada SOP", "score": 1 }
  ]
}
```
*Note: Repeat for all questions in all dimensions.*

### Step 3: Calculate score and generate recommendations
**POST** `/api/v1/assessments/1/calculate`
**Response:** `200 OK` with the calculated `total_score`, `level`, and `recommendations`.

### Step 4: Get recommendations (optional)
**GET** `/api/v1/assessments/1/recommendations`
**Response:** List of recommendations prioritized by gap score.

---

## 2. Mentoring Flow

### Step 1: Create mentoring request
**POST** `/api/v1/mentoring/requests`
```json
{
  "topic": "Digital Marketing",
  "description": "Bantuan untuk setup Facebook Ads dan Instagram Business.",
  "department_id": 1
}
```

### Step 2: Assign mentor (Admin only)
**POST** `/api/v1/mentoring/requests/1/assign`
```json
{
  "mentor_user_id": 5
}
```

### Step 3: Create consultation session
**POST** `/api/v1/mentoring/requests/1/sessions`
```json
{
  "scheduled_at": "2026-05-01 10:00:00",
  "duration_minutes": 60,
  "medium": "online"
}
```

### Step 4: Add consultation notes (during/after session)
**POST** `/api/v1/mentoring/sessions/1/notes`
```json
{
  "content": "UMKM sudah memiliki akun IG tapi belum dioptimasi."
}
```

### Step 5: Mark consultation as completed
**POST** `/api/v1/mentoring/requests/1/complete`
