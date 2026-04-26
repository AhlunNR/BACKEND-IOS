const supabase = require('../config/supabase');

/**
 * Menyimpan riwayat pengerjaan kuis ke Supabase
 */
const saveHistory = async (record) => {
  const { data, error } = await supabase
    .from('quiz_history')
    .insert([{
      device_id: record.deviceId,
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

module.exports = { saveHistory, getAllHistory };
