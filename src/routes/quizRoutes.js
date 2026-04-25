const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// GET  /api/quiz/chapters        → Daftar bab yang tersedia
router.get('/chapters', quizController.getChapters);

// GET  /api/quiz/:chapterId      → Soal berdasarkan bab
router.get('/:chapterId', quizController.getQuestionsByChapter);

// POST /api/quiz/:chapterId/submit → Submit jawaban
router.post('/:chapterId/submit', quizController.submitAnswers);

module.exports = router;
