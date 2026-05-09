const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

// POST /api/history       → Simpan riwayat (authenticated)
router.post('/', requireAuth, historyController.saveHistory);

// GET  /api/history/me     → Riwayat user sendiri (authenticated)
router.get('/me', requireAuth, historyController.getMyHistory);

// GET  /api/history        → Semua riwayat (admin only)
router.get('/', requireAuth, requireAdmin, historyController.getAllHistory);

// DELETE /api/history      → Hapus semua (admin only)
router.delete('/', requireAuth, requireAdmin, historyController.deleteAllHistory);

// DELETE /api/history/:id  → Hapus satu record (admin only)
router.delete('/:id', requireAuth, requireAdmin, historyController.deleteHistoryById);

module.exports = router;
