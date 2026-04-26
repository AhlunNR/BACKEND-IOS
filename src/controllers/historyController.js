const historyService = require('../services/historyService');
const { success, error } = require('../utils/responseFormatter');

/**
 * POST /api/history
 * Menyimpan riwayat pengerjaan kuis dari client
 */
const saveHistory = async (req, res, next) => {
  try {
    const { deviceId, chapter, score, grade, correctCount, wrongCount, unansweredCount, totalQuestions, timeSpent } = req.body;

    if (!deviceId || chapter === undefined || score === undefined) {
      return error(res, 'Data riwayat tidak lengkap (deviceId, chapter, score wajib)', 400);
    }

    const record = await historyService.saveHistory({
      deviceId,
      chapter,
      score,
      grade: grade || 'D',
      correctCount: correctCount || 0,
      wrongCount: wrongCount || 0,
      unansweredCount: unansweredCount || 0,
      totalQuestions: totalQuestions || 0,
      timeSpent: timeSpent || 0,
    });

    return success(res, record, 'Riwayat berhasil disimpan', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/history
 * Mengambil seluruh riwayat kuis (untuk admin monitoring)
 */
const getAllHistory = async (req, res, next) => {
  try {
    const data = await historyService.getAllHistory();
    return success(res, data, 'Riwayat berhasil dimuat');
  } catch (err) {
    next(err);
  }
};

module.exports = { saveHistory, getAllHistory };
