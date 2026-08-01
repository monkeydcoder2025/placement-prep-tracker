const fs = require('fs');

const input = fs.readFileSync('c:/Users/monke/Downloads/placement/_ref/campx_syllabus.txt', 'utf-8');
const lines = input.split('\\n').map(l => l.trim()).filter(l => l);

const data = [];
let currentWeek = null;
let currentSession = null;
let weekNumber = 1;

function getPhase(wNum) {
  if (wNum <= 4) return { p: "Python Programming", n: 1 };
  if (wNum <= 8) return { p: "Data Analysis Libraries", n: 2 };
  if (wNum <= 10) return { p: "Data Visualization", n: 3 };
  if (wNum <= 12) return { p: "EDA & Data Analysis", n: 4 };
  if (wNum <= 16) return { p: "SQL", n: 5 };
  if (wNum <= 21) return { p: "Statistics & Probability", n: 6 };
  if (wNum === 22) return { p: "Linear Algebra", n: 7 };
  if (wNum <= 30) return { p: "Machine Learning Core", n: 8 };
  if (wNum <= 36) return { p: "ML Algorithms", n: 9 };
  return { p: "Advanced Topics", n: 10 };
}

for (let line of lines) {
  if (line.startsWith('Week ') || line.startsWith('Extra:') || line.startsWith('Capstone Project:') || line.startsWith('XGBoost') || line.startsWith('KMeans Clustering') || line.startsWith('Other Clustering')) {
    let title = line;
    if (title.startsWith('Week ')) {
      title = title.split(':').slice(1).join(':').trim();
    }
    
    let { p, n } = getPhase(weekNumber);
    currentWeek = {
      weekNumber: weekNumber++,
      title: title,
      phase: p,
      phaseNumber: n,
      sessions: []
    };
    data.push(currentWeek);
    currentSession = null;
  } else if (/^\\d+\\./.test(line)) {
    let sTitle = line.replace(/^\\d+\\.\\s*/, '').trim();
    currentSession = {
      id: \`w\${currentWeek.weekNumber}-s\${currentWeek.sessions.length + 1}\`,
      title: sTitle,
      subtopics: []
    };
    currentWeek.sessions.push(currentSession);
  } else if (line.startsWith('-')) {
    if (currentSession) {
      currentSession.subtopics.push(line.replace(/^- /, '').trim());
    }
  }
}

// Adjust capstone to 3 weeks
// Week 38-40
const capstoneWeek = data.find(w => w.title.includes('Capstone Project'));
if (capstoneWeek) {
  const sessions = capstoneWeek.sessions;
  capstoneWeek.title = "Capstone Project Part 1";
  capstoneWeek.sessions = sessions.slice(0, 4);
  
  const cap2 = {
    weekNumber: capstoneWeek.weekNumber + 1,
    title: "Capstone Project Part 2",
    phase: capstoneWeek.phase,
    phaseNumber: capstoneWeek.phaseNumber,
    sessions: sessions.slice(4, 8)
  };
  
  const cap3 = {
    weekNumber: capstoneWeek.weekNumber + 2,
    title: "Capstone Project Part 3",
    phase: capstoneWeek.phase,
    phaseNumber: capstoneWeek.phaseNumber,
    sessions: sessions.slice(8)
  };
  
  const idx = data.indexOf(capstoneWeek);
  data.splice(idx + 1, 0, cap2, cap3);
  
  // Update week numbers for subsequent weeks
  for (let i = idx + 1; i < data.length; i++) {
    data[i].weekNumber = capstoneWeek.weekNumber + (i - idx);
    // update session IDs
    data[i].sessions.forEach((s, sIdx) => {
      s.id = \`w\${data[i].weekNumber}-s\${sIdx + 1}\`;
    });
  }
}

fs.writeFileSync('c:/Users/monke/Downloads/placement/server/data/campxDSMP.json', JSON.stringify(data, null, 2));
