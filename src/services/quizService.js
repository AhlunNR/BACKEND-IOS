const supabase = require('../config/supabase');

/**
 * Mengambil soal berdasarkan chapter ID
 */
const getQuestionsByChapter = async (chapterId) => {
  let data, error;
  
  if (parseInt(chapterId) === 100) {
    // Ujian Gabungan II (Hardcore): Ambil 50 soal acak dari seluruh database
    const result = await supabase
      .from('questions')
      .select('id, chapter, question_text, options, correct_answer');
      
    if (result.error) {
      throw new Error(`Supabase error: ${result.error.message}`);
    }
    
    // Shuffle seluruh soal lintas bab
    let allQs = [...result.data];
    for (let i = allQs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQs[i], allQs[j]] = [allQs[j], allQs[i]];
    }
    // Ambil 50 teratas
    data = allQs.slice(0, 50);
  } else {
    // Kuis Normal per Bab
    const result = await supabase
      .from('questions')
      .select('id, chapter, question_text, options, correct_answer')
      .eq('chapter', chapterId)
      .order('id', { ascending: true });
      
    if (result.error) {
      throw new Error(`Supabase error: ${result.error.message}`);
    }
    data = result.data;
  }

  // Acak urutan soal (Fisher-Yates Shuffle)
  const shuffledData = [...data];
  for (let i = shuffledData.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledData[i], shuffledData[j]] = [shuffledData[j], shuffledData[i]];
  }

  // Menghilangkan Prefix ABCD dan Mengacak Opsi Jawaban (Shuffle Options)
  const processedData = shuffledData.map(q => {
    // Pastikan options adalah array (karena kadang terbaca sebagai string dari DB)
    let optionsArray = q.options;
    if (typeof optionsArray === 'string') {
      try {
        optionsArray = JSON.parse(optionsArray);
      } catch (e) {
        optionsArray = [];
      }
    }

    // 1. Strip huruf 'A. ', 'B. ' dari array options
    let strippedOptions = optionsArray.map(opt => opt.replace(/^[A-Z]\.\s*/, '').trim());
    
    // 2. Strip huruf 'A. ', 'B. ' dari correct_answer
    let strippedCorrect = q.correct_answer.replace(/^[A-Z]\.\s*/, '').trim();

    // 3. Shuffle array opsi jawaban agar urutannya acak
    for (let i = strippedOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [strippedOptions[i], strippedOptions[j]] = [strippedOptions[j], strippedOptions[i]];
    }

    return {
      ...q,
      options: strippedOptions,
      correct_answer: strippedCorrect
    };
  });

  return processedData;
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

  // Sisipkan Bab 100 (Ujian Gabungan II - Hardcore) secara virtual
  chapters.push({
    chapter: 100,
    questionCount: 50
  });

  chapters.sort((a, b) => a.chapter - b.chapter);

  return chapters;
};

module.exports = { getQuestionsByChapter, getAvailableChapters };
