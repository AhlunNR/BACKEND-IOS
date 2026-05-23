const fs = require('fs');
const path = require('path');

const seedFile = path.join(__dirname, 'src', 'db', 'seed.sql');
let content = fs.readFileSync(seedFile, 'utf-8');
const lines = content.split('\n');
const rowRegex = /^\((\d+),\s*'(.*?)',\s*'(.*?)',\s*'(.*?)'\)(,?)/;

const POOLS = {
  names: [
    "Sri Sultan Hamengkubuwono IX", "Lord Robert Baden Powell", "Ki Hajar Dewantara",
    "Soenardjo Atmodipuro", "Andri Bob Sunardi", "H. Mutahar", "W.R. Supratman",
    "Lord Edward Cecil", "Mayor Kenneth McLaren", "Agnes Baden-Powell",
    "Olave St. Clair Soames", "Samuel F.B. Morse", "Rudyard Kipling"
  ],
  ages: [
    "7 - 10 tahun", "11 - 15 tahun", "16 - 20 tahun", "21 - 25 tahun", "17 - 25 tahun", "14 - 18 tahun"
  ],
  groups: [
    "Barung", "Regu", "Sangga", "Reka", "Perindukan", "Pasukan", "Ambalan", "Racana", "Kwartir", "Gugus Depan"
  ],
  ranks: [
    "Mula, Bantu, Tata", "Ramu, Rakit, Terap", "Bantara, Laksana", "Purwa, Madya, Utama", 
    "Pramuka Garuda", "Siaga, Penggalang, Penegak"
  ],
  mottos: [
    "Dwisatya dan Dwidarma", "Trisatya dan Dasadarma", "Satyaku Kudarmakan, Darmaku Kubaktikan", 
    "Ing Ngarso Sung Tulodo", "Tut Wuri Handayani", "Ing Madyo Mangun Karso", 
    "Ikhlas Bakti Bina Bangsa", "Be Prepared (Selalu Siap)", "Good Turn (Berbuat Kebaikan)"
  ],
  knots: [
    "Simpul Mati (Reef Knot)", "Simpul Tiang (Bowline)", "Simpul Pangkal (Clove Hitch)", 
    "Simpul Anyam (Sheet Bend)", "Ikatan Palang (Square Lashing)", "Ikatan Silang", 
    "Simpul Delapan", "Simpul Tali Tenda (Taut-line Hitch)"
  ],
  books: [
    "Scouting for Boys", "Aids to Scouting", "The Jungle Book", "Rovering to Success", "Boyman"
  ],
  locations: [
    "Pulau Brownsea", "London", "Mafeking", "Afrika Selatan", "Olympia Hall", "Gilwell Park", "Kenya", "Nyeri"
  ],
  camping_gears: [
    "Sleeping Bag (Kantong Tidur)", "Matras", "Ransel (Carrier / Backpack)", "Ponco", 
    "Nesting", "Flysheet", "Groundsheet / Terpal", "Survival Kit", "Tenda Prisma"
  ]
};

function getPoolType(question, answer) {
  const q = question.toLowerCase();
  if (q.includes("siapa") || q.includes("bapak") || q.includes("pencipta") || q.includes("nama") || q.includes("tokoh")) return POOLS.names;
  if (q.includes("usia") || q.includes("umur")) return POOLS.ages;
  if (q.includes("satuan") || q.includes("kumpulan") || q.includes("wadah")) return POOLS.groups;
  if (q.includes("tingkatan") || q.includes("tku") || q.includes("tkk")) return POOLS.ranks;
  if (q.includes("semboyan") || q.includes("kode kehormatan") || q.includes("motto") || q.includes("prinsip")) return POOLS.mottos;
  if (q.includes("simpul") || q.includes("ikatan")) return POOLS.knots;
  if (q.includes("buku")) return POOLS.books;
  if (q.includes("kota") || q.includes("pulau") || q.includes("negara") || q.includes("tempat")) return POOLS.locations;
  if (q.includes("perlengkapan") || q.includes("alat") || q.includes("tenda")) return POOLS.camping_gears;
  return null;
}

// Extract original correct answers for fallback
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

// Original helpers
function isMorse(str) { return /^[.\-\s]+$/.test(str) && str.length > 0; }
function generateMorseDistractor(correctStr) {
  const chars = ['.', '-'];
  let length = correctStr.replace(/\s/g, '').length || 2;
  const parts = correctStr.split(' ');
  const distractors = parts.map(p => {
    let pRes = '';
    for (let i = 0; i < p.length; i++) pRes += chars[Math.floor(Math.random() * chars.length)];
    return pRes;
  });
  let candidate = distractors.join(' ');
  return candidate === correctStr ? generateMorseDistractor(correctStr) : candidate;
}
function isNumberWithSuffix(str) { return /^\d+(\s+[a-zA-Z]+)?$/.test(str) || /^\d{4}$/.test(str); }
function generateNumberDistractor(correctStr) {
  const match = correctStr.match(/^(\d+)(.*)$/);
  if (match) {
    const num = parseInt(match[1]);
    const suffix = match[2];
    let diff = Math.floor(Math.random() * 5) + 1;
    let newNum = num + (Math.random() > 0.5 ? diff : -diff);
    if (newNum <= 0 && num > 0) newNum = num + diff; 
    let candidate = newNum + suffix;
    return candidate === correctStr ? generateNumberDistractor(correctStr) : candidate;
  }
  return correctStr;
}
function isDate(str) { return /^\d{1,2}\s+[a-zA-Z]+\s+\d{4}$/.test(str); }
function generateDateDistractor(correctStr) {
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const parts = correctStr.split(' ');
  if (parts.length === 3) {
    let day = parseInt(parts[0]);
    let month = parts[1];
    let year = parseInt(parts[2]);
    const changeType = Math.floor(Math.random() * 3);
    if (changeType === 0) day = day + (Math.random() > 0.5 ? 2 : -2) || 1;
    else if (changeType === 1) month = months[Math.floor(Math.random() * months.length)];
    else year = year + (Math.random() > 0.5 ? 1 : -1);
    let candidate = `${day} ${month} ${year}`;
    return candidate === correctStr ? generateDateDistractor(correctStr) : candidate;
  }
  return correctStr;
}
function getWordCount(str) { return str.split(/\s+/).length; }

function getSmartDistractor(chapter, question, correctClean, excludeList) {
  let distractor = "";
  
  if (isMorse(correctClean)) distractor = generateMorseDistractor(correctClean);
  else if (isDate(correctClean)) distractor = generateDateDistractor(correctClean);
  else if (isNumberWithSuffix(correctClean)) distractor = generateNumberDistractor(correctClean);
  else {
    const pool = getPoolType(question, correctClean);
    if (pool) {
      const valid = pool.filter(a => !excludeList.includes(a) && a !== correctClean);
      if (valid.length > 0) {
        distractor = valid[Math.floor(Math.random() * valid.length)];
      }
    }
    
    // Fallback to chapter answers if no pool matched or pool exhausted
    if (!distractor) {
      const answers = chapterAnswers[chapter] || [];
      const valid = answers.filter(a => !excludeList.includes(a) && a !== correctClean);
      if (valid.length === 0) distractor = "Semua benar";
      else {
        const targetWords = getWordCount(correctClean);
        const similarLength = valid.filter(a => Math.abs(getWordCount(a) - targetWords) <= 2);
        const finalPool = similarLength.length > 0 ? similarLength : valid;
        distractor = finalPool[Math.floor(Math.random() * finalPool.length)];
      }
    }
  }
  
  return distractor;
}

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
    const correctLetter = correctFull.charAt(0); 
    
    let currentExclude = [correctClean];
    
    options = options.map((opt, i) => {
      const letter = ['A', 'B', 'C', 'D'][i];
      if (letter !== correctLetter) {
        let distractor = getSmartDistractor(chapter, question, correctClean, currentExclude);
        currentExclude.push(distractor);
        return `${letter}. ${distractor}`;
      }
      return opt;
    });
    
    return `(${chapter}, '${question}', '${JSON.stringify(options)}', '${correctFull}')${comma}`;
  }
  return line;
});

fs.writeFileSync(seedFile, updatedLines.join('\n'), 'utf-8');
console.log('Successfully refined seed.sql with ULTIMATE SEMANTIC distractors!');
