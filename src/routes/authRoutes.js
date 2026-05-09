const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');

// GET /api/auth/profile → Ambil profil user yang login
router.get('/profile', requireAuth, authController.getProfile);

module.exports = router;
