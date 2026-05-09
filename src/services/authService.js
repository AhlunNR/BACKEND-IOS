const supabase = require('../config/supabase');

/**
 * Ambil atau buat profil user
 */
const getOrCreateProfile = async (userId, email, fullName, avatarUrl) => {
  // Coba ambil profil yang sudah ada
  let { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    // Buat profil baru
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        email,
        full_name: fullName || '',
        avatar_url: avatarUrl || '',
        role: 'user',
      }])
      .select()
      .single();

    if (insertError) {
      throw new Error(`Gagal membuat profil: ${insertError.message}`);
    }
    profile = newProfile;
  }

  return profile;
};

/**
 * Ambil profil berdasarkan ID
 */
const getProfileById = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(`Gagal mengambil profil: ${error.message}`);
  }

  return data;
};

module.exports = { getOrCreateProfile, getProfileById };
