const fs = require('fs');
const path = require('path');

const seedFile = path.join(__dirname, 'src', 'db', 'seed.sql');
let content = fs.readFileSync(seedFile, 'utf-8');
const lines = content.split('\n');
const rowRegex = /^\((\d+),\s*'(.*?)',\s*'(.*?)',\s*'(.*?)'\)(,?)/;

const POOLS = {
  names: ["Sri Sultan Hamengkubuwono IX", "Lord Robert Baden Powell", "Ki Hajar Dewantara", "Soenardjo Atmodipuro", "Andri Bob Sunardi", "H. Mutahar", "W.R. Supratman", "Lord Edward Cecil", "Mayor Kenneth McLaren", "Agnes Baden-Powell", "Olave St. Clair Soames", "Samuel F.B. Morse", "Rudyard Kipling"],
  ages: ["7 - 10 tahun", "11 - 15 tahun", "16 - 20 tahun", "21 - 25 tahun", "17 - 25 tahun", "14 - 18 tahun"],
  groups: ["Barung", "Regu", "Sangga", "Reka", "Perindukan", "Pasukan", "Ambalan", "Racana", "Kwartir", "Gugus Depan"],
  ranks: ["Mula, Bantu, Tata", "Ramu, Rakit, Terap", "Bantara, Laksana", "Purwa, Madya, Utama", "Pramuka Garuda", "Siaga, Penggalang, Penegak"],
  mottos: ["Dwisatya dan Dwidarma", "Trisatya dan Dasadarma", "Satyaku Kudarmakan, Darmaku Kubaktikan", "Ing Ngarso Sung Tulodo", "Tut Wuri Handayani", "Ing Madyo Mangun Karso", "Ikhlas Bakti Bina Bangsa", "Be Prepared (Selalu Siap)", "Good Turn (Berbuat Kebaikan)"],
  knots: ["Simpul Mati (Reef Knot)", "Simpul Tiang (Bowline)", "Simpul Pangkal (Clove Hitch)", "Simpul Anyam (Sheet Bend)", "Ikatan Palang (Square Lashing)", "Ikatan Silang", "Simpul Delapan", "Simpul Tali Tenda (Taut-line Hitch)"],
  books: ["Scouting for Boys", "Aids to Scouting", "The Jungle Book", "Rovering to Success", "Boyman"],
  locations: ["Pulau Brownsea", "London", "Mafeking", "Afrika Selatan", "Olympia Hall", "Gilwell Park", "Kenya", "Nyeri"],
  camping_gears: ["Sleeping Bag (Kantong Tidur)", "Matras", "Ransel (Carrier / Backpack)", "Ponco", "Nesting", "Flysheet", "Groundsheet / Terpal", "Survival Kit", "Tenda Prisma"],
  letters: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
  numbers: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "15", "20", "25"],
  colors: ["Merah", "Kuning", "Hijau", "Biru", "Hitam", "Putih", "Coklat", "Abu-abu", "Ungu"],
  medical: ["Diare", "Disentri", "Hipotermia", "Demam Berdarah", "Luka Bakar", "Patah Tulang", "Terkilir", "Pendarahan", "Pingsan"],
  directions: ["Utara", "Selatan", "Timur", "Barat", "Barat Daya", "Barat Laut", "Timur Laut", "Tenggara"],
  ciphers: ["Sandi Kotak 1", "Sandi Kotak 2", "Sandi Rumput", "Sandi AN", "Sandi AZ", "Sandi Angka", "Sandi Jam", "Sandi Kimia", "Sandi Morse", "Sandi Semaphore", "Sandi Ular", "Sandi Arab", "Sandi Siput", "Sandi Braille"],
  maps: ["Peta Topografi", "Legenda Peta", "Skala", "Garis Kontur", "Indeks Kontur", "UTM", "Resection", "Intersection", "Easting", "Northing", "Deklinasi", "Orientasi Peta", "Curvimeter", "Protractor"],
  meanings: ["Rahasia", "Pesan", "Sandi", "Keberanian", "Kesucian", "Kejayaan", "Kekuatan", "Tulisan", "Isyarat"],
  morse_codes: [".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..", ".---", "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.", "...", "-", "..-", "...-", ".--", "-..-", "-.--", "--.."]
};

// Hardcoded exact overrides for extremely specific questions to guarantee perfection
const EXACT_OVERRIDES = {
  'Huruf yang direpresentasikan dengan satu garis (-) dalam sandi Morse adalah...': ['E', 'M', 'N'],
  'Huruf yang direpresentasikan dengan satu titik (.) dalam sandi Morse adalah...': ['T', 'I', 'S'],
  'Kata "Sandi" berasal dari bahasa Sanskerta, yang memiliki arti...': ['Pesan', 'Tulisan', 'Isyarat'],
  'Sinyal marabahaya darurat atau minta tolong standar internasional (SOS) dalam sandi Morse ditulis dengan...': ['--- ... ---', '... --- ...', '... .-. ...', '--- .-. ---'],
};

function getPoolType(question, answer) {
  const q = question.toLowerCase();
  const a = answer.toLowerCase();
  
  if (q.includes("huruf") || a.length === 1 && a.match(/[a-z]/i)) return POOLS.letters;
  if (q.includes("warna") || a.includes("merah") || a.includes("biru")) return POOLS.colors;
  if (q.includes("sandi") && a.includes("sandi")) return POOLS.ciphers;
  if (q.includes("penyakit") || q.includes("luka") || q.includes("p3k") || q.includes("darurat")) return POOLS.medical;
  if (q.includes("arah") || q.includes("utara") || q.includes("selatan")) return POOLS.directions;
  if (q.includes("peta") || q.includes("garis kontur") || q.includes("koordinat")) return POOLS.maps;
  if (q.includes("arti") || q.includes("makna")) return POOLS.meanings;
  
  if (q.includes("siapa") || q.includes("bapak") || q.includes("pencipta") || q.includes("nama") || q.includes("tokoh") || a.includes("baden")) return POOLS.names;
  if (q.includes("usia") || q.includes("umur")) return POOLS.ages;
  if (q.includes("satuan") || q.includes("kumpulan") || q.includes("wadah")) return POOLS.groups;
  if (q.includes("tingkatan") || q.includes("tku") || q.includes("tkk")) return POOLS.ranks;
  if (q.includes("semboyan") || q.includes("kode kehormatan") || q.includes("motto") || q.includes("prinsip")) return POOLS.mottos;
  if (q.includes("simpul") || q.includes("ikatan")) return POOLS.knots;
  if (q.includes("buku")) return POOLS.books;
  if (q.includes("kota") || q.includes("pulau") || q.includes("negara") || q.includes("tempat")) return POOLS.locations;
  if (q.includes("perlengkapan") || q.includes("alat") || q.includes("tenda")) return POOLS.camping_gears;
  
  // if correct answer is a single morse code symbol
  if (/^[.\-\s]+$/.test(answer) && answer.length > 0) return POOLS.morse_codes;
  
  // if correct answer is just a number
  if (/^\d+$/.test(answer)) return POOLS.numbers;
  
  return null;
}

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

function isMorse(str) { return /^[.\-\s]+$/.test(str) && str.length > 0; }
function isNumberWithSuffix(str) { return /^\d+(\s+[a-zA-Z]+)?$/.test(str) || /^\d{4}$/.test(str); }
function isDate(str) { return /^\d{1,2}\s+[a-zA-Z]+\s+\d{4}$/.test(str); }
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
  // 1. Check Exact Overrides first
  if (EXACT_OVERRIDES[question]) {
      const valid = EXACT_OVERRIDES[question].filter(a => !excludeList.includes(a) && a !== correctClean);
      if (valid.length > 0) return valid[Math.floor(Math.random() * valid.length)];
  }

  let distractor = "";
  
  if (isDate(correctClean)) distractor = generateDateDistractor(correctClean);
  else if (isNumberWithSuffix(correctClean) && !/^[A-Z]$/i.test(correctClean)) distractor = generateNumberDistractor(correctClean);
  else {
    const pool = getPoolType(question, correctClean);
    if (pool) {
      const valid = pool.filter(a => !excludeList.includes(a) && a !== correctClean);
      if (valid.length > 0) {
        distractor = valid[Math.floor(Math.random() * valid.length)];
      }
    }
    
    // Fallback
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
console.log('Successfully refined seed.sql with STATIC PERFECT distractors!');
