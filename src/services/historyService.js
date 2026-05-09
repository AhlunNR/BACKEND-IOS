const supabase = require('../config/supabase');

/**
 * Menyimpan riwayat pengerjaan kuis ke Supabase (per-user)
 */
const saveHistory = async (record) => {
  const { data, error } = await supabase
    .from('quiz_history')
    .insert([{
      user_id: record.userId,
      user_name: record.userName || 'Anonim',
      device_id: record.deviceId || 'web',
      chapter: record.chapter,
      score: record.score,
      grade: record.grade,
      correct_count: record.correctCount,
      wrong_count: record.wrongCount,
      unanswered_count: record.unansweredCount,
      total_questions: record.totalQuestions,
      time_spent: record.timeSpent || 0,
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return data;
};

/**
 * Mengambil riwayat kuis milik satu user
 */
const getHistoryByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('quiz_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return data;
};

/**
 * Mengambil seluruh riwayat kuis (untuk admin)
 */
const getAllHistory = async () => {
  const { data, error } = await supabase
    .from('quiz_history')
    .select('*, profiles:user_id(full_name, email, avatar_url)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return data;
};

/**
 * Menghapus seluruh riwayat kuis (admin)
 */
const deleteAllHistory = async () => {
  const { error } = await supabase
    .from('quiz_history')
    .delete()
    .neq('id', 0);

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return true;
};

/**
 * Menghapus satu record riwayat berdasarkan ID
 */
const deleteHistoryById = async (id) => {
  const { error } = await supabase
    .from('quiz_history')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return true;
};

module.exports = { saveHistory, getHistoryByUserId, getAllHistory, deleteAllHistory, deleteHistoryById };
