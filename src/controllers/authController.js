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

/**
 * PUT /api/auth/profile
 * Update profil user (full_name)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { fullName } = req.body;

    if (!fullName || fullName.trim().length === 0) {
      return error(res, 'Nama tidak boleh kosong', 400);
    }

    if (fullName.trim().length > 50) {
      return error(res, 'Nama maksimal 50 karakter', 400);
    }

    const profile = await authService.updateProfile(req.user.id, { fullName: fullName.trim() });
    return success(res, profile, 'Profil berhasil diperbarui');
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile };
