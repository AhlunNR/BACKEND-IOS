const historyService = require('../services/historyService');
const { success, error } = require('../utils/responseFormatter');

/**
 * POST /api/history (authenticated)
 * Menyimpan riwayat pengerjaan kuis
 */
const saveHistory = async (req, res, next) => {
  try {
    const { chapter, score, grade, correctCount, wrongCount, unansweredCount, totalQuestions, timeSpent } = req.body;

    if (chapter === undefined || score === undefined) {
      return error(res, 'Data riwayat tidak lengkap (chapter, score wajib)', 400);
    }

    const record = await historyService.saveHistory({
      userId: req.user.id,
      userName: req.user.fullName || 'Anonim',
      deviceId: 'web',
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
 * GET /api/history/me (authenticated)
 * Mengambil riwayat kuis milik user yang login
 */
const getMyHistory = async (req, res, next) => {
  try {
    const data = await historyService.getHistoryByUserId(req.user.id);
    return success(res, data, 'Riwayat berhasil dimuat');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/history (admin only)
 * Mengambil seluruh riwayat kuis
 */
const getAllHistory = async (req, res, next) => {
  try {
    const data = await historyService.getAllHistory();
    return success(res, data, 'Riwayat berhasil dimuat');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/history (admin only)
 */
const deleteAllHistory = async (req, res, next) => {
  try {
    await historyService.deleteAllHistory();
    return success(res, null, 'Semua riwayat berhasil dihapus');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/history/:id (admin only)
 */
const deleteHistoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    await historyService.deleteHistoryById(parseInt(id));
    return success(res, null, 'Riwayat berhasil dihapus');
  } catch (err) {
    next(err);
  }
};

module.exports = { saveHistory, getMyHistory, getAllHistory, deleteAllHistory, deleteHistoryById };
