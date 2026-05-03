# MANGO Scope (Phase 1)

## Scope

System hanya mencakup:

* Assessment (scoring)
* Recommendation
* Mentoring (pendampingan)

Tidak termasuk:

* ERP
* MES
* IoT
* LMS

---

## 1. Assessment Flow

```text
UMKM
→ isi questionnaire
→ simpan answers
→ hitung score
→ simpan assessment_result
→ generate recommendation
```

---

## 2. Scoring Logic

### Per Category

```text
category_score = avg(answer.score)
```

### Total Score

```text
total_score = weighted_avg(category_score)
```

### Level

```text
1.0 – 1.8 → basic
1.9 – 2.6 → developing
2.7 – 5.0 → advanced
```

---

## 3. Recommendation Logic

```text
gap_score = max_score - category_score
```

Priority:

```text
if gap_score > 2 → high
if gap_score > 1 → medium
else → low
```

---

## 4. Mentoring Flow

```text
UMKM create consultation_request
→ assign mentor
→ create session
→ add notes
→ mark done
```

---

## 5. Integration Rule

* assessment_result wajib sebelum mentoring
* recommendation jadi dasar mentoring
* mentoring fokus pada gap tertinggi

---

## 6. Output

* assessment_result
* category_score
* total_score
* level
* recommendation
* mentoring_activity

---
