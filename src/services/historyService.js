const supabase = require('../config/supabase');

/**
 * Menyimpan riwayat pengerjaan kuis ke Supabase
 */
const saveHistory = async (record) => {
  const { data, error } = await supabase
    .from('quiz_history')
    .insert([{
      device_id: record.deviceId,
      user_name: record.userName || 'Anonim',
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
 * Mengambil seluruh riwayat kuis (untuk admin)
 */
const getAllHistory = async () => {
  const { data, error } = await supabase
    .from('quiz_history')
    .select('*')
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
    .neq('id', 0); // delete all rows

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

module.exports = { saveHistory, getAllHistory, deleteAllHistory, deleteHistoryById };
