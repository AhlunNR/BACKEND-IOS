const quizService = require('../services/quizService');
const { success, error } = require('../utils/responseFormatter');

/**
 * GET /api/quiz/chapters
 * Mendapatkan daftar bab yang tersedia
 */
const getChapters = async (req, res, next) => {
  try {
    const chapters = await quizService.getAvailableChapters();
    return success(res, chapters, 'Daftar bab berhasil dimuat');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/quiz/:chapterId
 * Mendapatkan semua soal dari bab tertentu
 */
const getQuestionsByChapter = async (req, res, next) => {
  try {
    const { chapterId } = req.params;
    const chapterNum = parseInt(chapterId);

    if (isNaN(chapterNum)) {
      return error(res, 'Chapter ID harus berupa angka', 400);
    }

    const questions = await quizService.getQuestionsByChapter(chapterNum);

    if (!questions || questions.length === 0) {
      return error(res, `Tidak ada soal untuk bab ${chapterNum}`, 404);
    }

    return success(res, {
      chapter: chapterNum,
      totalQuestions: questions.length,
      timeLimit: 603, // 10 menit 3 detik
      questions,
    }, `Soal bab ${chapterNum} berhasil dimuat`);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/quiz/:chapterId/submit
 * Menerima jawaban dan menghitung skor
 */
const submitAnswers = async (req, res, next) => {
  try {
    const { chapterId } = req.params;
    const { answers, timeSpent } = req.body;
    // answers format: { "question_id": "jawaban_user", ... }

    const chapterNum = parseInt(chapterId);
    if (isNaN(chapterNum)) {
      return error(res, 'Chapter ID harus berupa angka', 400);
    }

    if (!answers || typeof answers !== 'object') {
      return error(res, 'Format jawaban tidak valid', 400);
    }

    // Ambil soal dari DB untuk verifikasi
    const questions = await quizService.getQuestionsByChapter(chapterNum);

    if (!questions || questions.length === 0) {
      return error(res, `Tidak ada soal untuk bab ${chapterNum}`, 404);
    }

    // Hitung skor
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    const results = [];

    questions.forEach((q) => {
      const userAnswer = answers[q.id] || null;
      const isCorrect = userAnswer === q.correct_answer;

      if (!userAnswer) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      results.push({
        questionId: q.id,
        questionText: q.question_text,
        userAnswer,
        correctAnswer: q.correct_answer,
        isCorrect: userAnswer ? isCorrect : null,
      });
    });

    const totalQuestions = questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    return success(res, {
      chapter: chapterNum,
      score,
      correctCount,
      wrongCount,
      unansweredCount,
      totalQuestions,
      timeSpent: timeSpent || 0,
      results,
    }, 'Jawaban berhasil dinilai');
  } catch (err) {
    next(err);
  }
};

module.exports = { getChapters, getQuestionsByChapter, submitAnswers };
