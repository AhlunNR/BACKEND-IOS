const fs = require('fs');
const path = require('path');

const seedFile = path.join(__dirname, 'src', 'db', 'seed.sql');
let content = fs.readFileSync(seedFile, 'utf-8');

const lines = content.split('\n');

// 1. Collect all correct answers by chapter
const chapterAnswers = {};

const rowRegex = /^\((\d+),\s*'(.*?)',\s*'(.*?)',\s*'(.*?)'\)(,?)/;

lines.forEach(line => {
  const match = line.match(rowRegex);
  if (match) {
    const chapter = match[1];
    let correct = match[4].replace(/^[A-D]\.\s*/, '').trim();
    if (!chapterAnswers[chapter]) {
      chapterAnswers[chapter] = [];
    }
    if (!chapterAnswers[chapter].includes(correct)) {
      chapterAnswers[chapter].push(correct);
    }
  }
});

// Helper to get random item from array excluding some values
function getRandomDistractor(chapter, excludeList) {
  const answers = chapterAnswers[chapter] || [];
  const valid = answers.filter(a => !excludeList.includes(a));
  if (valid.length === 0) return "Semua benar";
  const randomIndex = Math.floor(Math.random() * valid.length);
  return valid[randomIndex];
}

// 2. Process and replace
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
    
    let currentExclude = [correctClean];
    
    // Check if there are placeholders
    let hasChanges = false;
    options = options.map(opt => {
      const prefix = opt.substring(0, 3); // "A. "
      const value = opt.substring(3).trim();
      if (value === '-') {
        hasChanges = true;
        const distractor = getRandomDistractor(chapter, currentExclude);
        currentExclude.push(distractor);
        return prefix + distractor;
      }
      return opt;
    });
    
    if (hasChanges) {
      // Reconstruct line
      return `(${chapter}, '${question}', '${JSON.stringify(options)}', '${correctFull}')${comma}`;
    }
  }
  return line;
});

fs.writeFileSync(seedFile, updatedLines.join('\n'), 'utf-8');
console.log('Successfully updated seed.sql with tricky distractors!');
