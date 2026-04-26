const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

// POST /api/history  → Simpan riwayat kuis dari client
router.post('/', historyController.saveHistory);

// GET  /api/history  → Ambil semua riwayat (untuk admin)
router.get('/', historyController.getAllHistory);

module.exports = router;
