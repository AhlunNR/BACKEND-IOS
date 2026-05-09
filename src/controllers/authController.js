const authService = require('../services/authService');
const { success, error } = require('../utils/responseFormatter');

/**
 * GET /api/auth/profile
 * Ambil profil user yang sedang login
 */
const getProfile = async (req, res, next) => {
  try {
    const profile = await authService.getProfileById(req.user.id);
    return success(res, profile, 'Profil berhasil dimuat');
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile };
