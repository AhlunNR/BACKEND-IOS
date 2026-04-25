const supabase = require('../config/supabase');

/**
 * Mengambil soal berdasarkan chapter ID
 */
const getQuestionsByChapter = async (chapterId) => {
  const { data, error } = await supabase
    .from('questions')
    .select('id, chapter, question_text, options, correct_answer')
    .eq('chapter', chapterId)
    .order('id', { ascending: true });

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  // Acak urutan soal (Fisher-Yates Shuffle)
  const shuffledData = [...data];
  for (let i = shuffledData.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledData[i], shuffledData[j]] = [shuffledData[j], shuffledData[i]];
  }

  return shuffledData;
};

/**
 * Mengambil daftar chapter yang tersedia beserta jumlah soalnya
 */
const getAvailableChapters = async () => {
  const { data, error } = await supabase
    .from('questions')
    .select('chapter');

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  // Hitung jumlah soal per bab
  const chapterMap = {};
  data.forEach((row) => {
    chapterMap[row.chapter] = (chapterMap[row.chapter] || 0) + 1;
  });

  // Format ke array
  const chapters = Object.entries(chapterMap).map(([chapter, count]) => ({
    chapter: parseInt(chapter),
    questionCount: count,
  }));

  chapters.sort((a, b) => a.chapter - b.chapter);

  return chapters;
};

module.exports = { getQuestionsByChapter, getAvailableChapters };
