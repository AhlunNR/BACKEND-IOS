const fs = require('fs');
const path = require('path');

const seedFile = path.join(__dirname, 'src', 'db', 'seed.sql');
let content = fs.readFileSync(seedFile, 'utf-8');
const lines = content.split('\n');

const rowRegex = /^\((\d+),\s*'(.*?)',\s*'(.*?)',\s*'(.*?)'\)(,?)/;

// Collect correct answers by chapter to use as general text distractors
const chapterAnswers = {};
lines.forEach(line => {
  const match = line.match(rowRegex);
  if (match) {
    const chapter = match[1];
    let correct = match[4].replace(/^[A-D]\.\s*/, '').trim();
    if (!chapterAnswers[chapter]) chapterAnswers[chapter] = [];
    if (!chapterAnswers[chapter].includes(correct)) chapterAnswers[chapter].push(correct);
  }
});

// Helper functions for smart distractors
function isMorse(str) {
  return /^[.\-\s]+$/.test(str) && str.length > 0;
}

function generateMorseDistractor(correctStr) {
  const chars = ['.', '-'];
  let length = correctStr.replace(/\s/g, '').length;
  if (length === 0) length = 2;
  let result = '';
  // Randomize morse parts based on word count
  const parts = correctStr.split(' ');
  const distractors = parts.map(p => {
    let pRes = '';
    for (let i = 0; i < p.length; i++) {
      pRes += chars[Math.floor(Math.random() * chars.length)];
    }
    return pRes;
  });
  let candidate = distractors.join(' ');
  return candidate === correctStr ? generateMorseDistractor(correctStr) : candidate;
}

function isNumberWithSuffix(str) {
  return /^\d+(\s+[a-zA-Z]+)?$/.test(str) || /^\d{4}$/.test(str);
}

function generateNumberDistractor(correctStr) {
  const match = correctStr.match(/^(\d+)(.*)$/);
  if (match) {
    const num = parseInt(match[1]);
    const suffix = match[2];
    // Generate a number close to the original
    let diff = Math.floor(Math.random() * 5) + 1;
    let sign = Math.random() > 0.5 ? 1 : -1;
    let newNum = num + (diff * sign);
    if (newNum <= 0 && num > 0) newNum = num + diff; 
    let candidate = newNum + suffix;
    return candidate === correctStr ? generateNumberDistractor(correctStr) : candidate;
  }
  return correctStr;
}

function isDate(str) {
  // matches formats like "14 Agustus 1961" or "22 Februari 1857"
  return /^\d{1,2}\s+[a-zA-Z]+\s+\d{4}$/.test(str);
}

function generateDateDistractor(correctStr) {
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const parts = correctStr.split(' ');
  if (parts.length === 3) {
    let day = parseInt(parts[0]);
    let month = parts[1];
    let year = parseInt(parts[2]);

    const changeType = Math.floor(Math.random() * 3); // 0: day, 1: month, 2: year
    if (changeType === 0) {
      day = day + (Math.random() > 0.5 ? 2 : -2);
      if (day <= 0) day = 1;
    } else if (changeType === 1) {
      month = months[Math.floor(Math.random() * months.length)];
    } else {
      year = year + (Math.random() > 0.5 ? 1 : -1);
    }
    let candidate = `${day} ${month} ${year}`;
    return candidate === correctStr ? generateDateDistractor(correctStr) : candidate;
  }
  return correctStr;
}

function getWordCount(str) {
  return str.split(/\s+/).length;
}

function generateTextDistractor(chapter, correctStr, excludeList) {
  const answers = chapterAnswers[chapter] || [];
  const valid = answers.filter(a => !excludeList.includes(a));
  
  if (valid.length === 0) return "Semua benar";
  
  // Try to find answers with similar word count (± 2 words)
  const targetWords = getWordCount(correctStr);
  const similarLength = valid.filter(a => Math.abs(getWordCount(a) - targetWords) <= 2);
  
  const pool = similarLength.length > 0 ? similarLength : valid;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

function getSmartDistractor(chapter, correctClean, excludeList) {
  let distractor = "";
  if (isMorse(correctClean)) {
    distractor = generateMorseDistractor(correctClean);
    // ensure uniqueness
    let attempts = 0;
    while (excludeList.includes(distractor) && attempts < 10) {
      distractor = generateMorseDistractor(correctClean);
      attempts++;
    }
  } else if (isDate(correctClean)) {
    distractor = generateDateDistractor(correctClean);
    let attempts = 0;
    while (excludeList.includes(distractor) && attempts < 10) {
      distractor = generateDateDistractor(correctClean);
      attempts++;
    }
  } else if (isNumberWithSuffix(correctClean)) {
    distractor = generateNumberDistractor(correctClean);
    let attempts = 0;
    while (excludeList.includes(distractor) && attempts < 10) {
      distractor = generateNumberDistractor(correctClean);
      attempts++;
    }
  } else {
    distractor = generateTextDistractor(chapter, correctClean, excludeList);
  }
  
  return distractor;
}

// Process and replace all incorrect options
let updatedLines = lines.map(line => {
  const match = line.match(rowRegex);
  if (match) {
    const chapter = match[1];
    const question = match[2];
    const optionsStr = match[3];
    const correctFull = match[4];
    const comma = match[5];
    
    let options = JSON.parse(optionsStr);
    const correctClean = correctFull.replace(/^[A-D]\.\s*/, '').trim();
    const correctLetter = correctFull.charAt(0); // 'A', 'B', 'C', or 'D'
    
    let currentExclude = [correctClean];
    
    options = options.map((opt, i) => {
      const letter = ['A', 'B', 'C', 'D'][i];
      // If this option is not the correct answer, rewrite it with a smart distractor!
      if (letter !== correctLetter) {
        let distractor = getSmartDistractor(chapter, correctClean, currentExclude);
        currentExclude.push(distractor);
        return `${letter}. ${distractor}`;
      }
      return opt; // Keep the correct answer unchanged
    });
    
    return `(${chapter}, '${question}', '${JSON.stringify(options)}', '${correctFull}')${comma}`;
  }
  return line;
});

fs.writeFileSync(seedFile, updatedLines.join('\n'), 'utf-8');
console.log('Successfully refined seed.sql with CONTEXT-AWARE tricky distractors!');
