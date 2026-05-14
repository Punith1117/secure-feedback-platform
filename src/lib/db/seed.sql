-- =========================================
-- Seed Data for Feedback System
-- Templates:
--   1. Theory
--   2. Lab
--   3. Workshop
-- =========================================

-- =========================================
-- THEORY QUESTIONS
-- =========================================

WITH theory_template AS (
  INSERT INTO templates (name)
  VALUES ('Theory')
  RETURNING id
),
theory_questions AS (
  INSERT INTO question_bank (question_bank)
  VALUES
    ('How clearly was the subject explained during lectures?'),
    ('How effective was the teaching pace for understanding concepts?'),
    ('How helpful were the lecture materials and notes?'),
    ('How interactive and engaging were the theory classes?'),
    ('How well did the course improve your understanding of the subject?')
  RETURNING id, question_bank
)

INSERT INTO template_questions (template_id, question_id)
SELECT
  theory_template.id,
  theory_questions.id
FROM theory_template, theory_questions;

-- =========================================
-- LAB QUESTIONS
-- =========================================

WITH lab_template AS (
  INSERT INTO templates (name)
  VALUES ('Lab')
  RETURNING id
),
lab_questions AS (
  INSERT INTO question_bank (question_bank)
  VALUES
    ('How useful were the lab sessions for practical understanding?'),
    ('How well were the lab experiments explained before execution?'),
    ('How adequate were the lab equipment and resources?'),
    ('How supportive was the lab instructor during practical sessions?'),
    ('How effectively did the lab sessions improve your hands-on skills?')
  RETURNING id, question_bank
)

INSERT INTO template_questions (template_id, question_id)
SELECT
  lab_template.id,
  lab_questions.id
FROM lab_template, lab_questions;

-- =========================================
-- WORKSHOP QUESTIONS
-- =========================================

WITH workshop_template AS (
  INSERT INTO templates (name)
  VALUES ('Workshop')
  RETURNING id
),
workshop_questions AS (
  INSERT INTO question_bank (question_bank)
  VALUES
    ('How relevant was the workshop content to your learning needs?'),
    ('How engaging and interactive was the workshop session?'),
    ('How clearly were the workshop activities demonstrated?'),
    ('How useful were the practical exercises conducted in the workshop?'),
    ('How satisfied are you with the overall workshop experience?')
  RETURNING id, question_bank
)

INSERT INTO template_questions (template_id, question_id)
SELECT
  workshop_template.id,
  workshop_questions.id
FROM workshop_template, workshop_questions;