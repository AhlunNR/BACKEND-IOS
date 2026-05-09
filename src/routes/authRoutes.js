const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');

// GET /api/auth/profile → Ambil profil user yang login
router.get('/profile', requireAuth, authController.getProfile);

// PUT /api/auth/profile → Update profil user
router.put('/profile', requireAuth, authController.updateProfile);

module.exports = router;
