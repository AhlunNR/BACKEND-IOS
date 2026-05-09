const supabase = require('../config/supabase');

/**
 * Middleware: Verifikasi token JWT dari Supabase Auth
 * Attach req.user = { id, email, role }
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token autentikasi tidak ditemukan',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau sudah kadaluarsa',
      });
    }

    // Get profile (including role)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      role: profile?.role || 'user',
      fullName: profile?.full_name || user.user_metadata?.full_name || '',
    };

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memverifikasi autentikasi',
    });
  }
};

/**
 * Middleware: Hanya admin yang bisa akses
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin.',
    });
  }
  next();
};

module.exports = { requireAuth, requireAdmin };
