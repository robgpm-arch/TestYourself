// scripts/build-registry.mjs
// Node 18+ (ESM). Run: node scripts/build-registry.mjs
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const REG_DIR = './registry';
const Q_DIR   = join(REG_DIR, 'questions');

// ---- Master definitions --------------------------------------------------

// Mediums
const mediums = [
  { id: 'english', name: 'English', enabled: true, order: 1 },
  { id: 'telugu',  name: 'Telugu',  enabled: true, order: 2 },
  { id: 'hindi',   name: 'Hindi',   enabled: true, order: 3 },
];

// Boards per medium
const boardsByMedium = {
  english: [
    { id: 'iit-foundation', name: 'IIT Foundation', order: 1 },
    { id: 'cbse',           name: 'CBSE',           order: 2 },
    { id: 'ts',             name: 'Telangana (TS)', order: 3 },
    { id: 'ap',             name: 'Andhra Pradesh', order: 4 },
  ],
  telugu: [
    { id: 'ts', name: 'Telangana (TS)', order: 1 },
    { id: 'ap', name: 'Andhra Pradesh', order: 2 },
  ],
  hindi: [
    { id: 'cbse', name: 'CBSE', order: 1 },
  ],
};

// Courses (for ALL boards)
const courseNames = [
  { id: 'class-3',  name: 'Class III',  order: 3 },
  { id: 'class-4',  name: 'Class IV',   order: 4 },
  { id: 'class-5',  name: 'Class V',    order: 5 },
  { id: 'class-6',  name: 'Class VI',   order: 6 },
  { id: 'class-7',  name: 'Class VII',  order: 7 },
  { id: 'class-8',  name: 'Class VIII', order: 8 },
  { id: 'class-9',  name: 'Class IX',   order: 9 },
  { id: 'class-10', name: 'Class X',    order: 10 },
];

// Subjects (for ALL courses)
const subjects = [
  { id: 'telugu',          name: 'Telugu',          order: 1 },
  { id: 'hindi',           name: 'Hindi',           order: 2 },
  { id: 'english',         name: 'English',         order: 3 },
  { id: 'physical-science',name: 'Physical Science',order: 4 },
  { id: 'biology',         name: 'Biology',         order: 5 },
  { id: 'social-studies',  name: 'Social Studies',  order: 6 },
];

// Chapters (1..25 for each subject)
const CHAPTER_COUNT = 25;

// Sets per chapter
const SET_IDS = [
  { id: 'set-1', name: 'Set 1', order: 1 },
  { id: 'set-2', name: 'Set 2', order: 2 },
  { id: 'set-3', name: 'Set 3', order: 3 },
  { id: 'set-4', name: 'Set 4', order: 4 },
];

// 1-MCQ model for each set file
const oneMCQ = (title='Sample MCQ') => ({
  version: 1,
  meta: { title, timeLimitSec: 0 },
  questions: [
    {
      id: 'q1',
      type: 'mcq',
      question: 'Which option is correct?',
      options: ['Option A','Option B','Option C','Option D'],
      correctAnswer: 0,
      explanation: 'This is a model question. Replace with real content.',
      difficulty: 'easy',
      tags: []
    }
  ]
});

// ---- Build rows ----------------------------------------------------------

function slug(...parts) {
  return parts.join('-').replace(/\s+/g,'-').toLowerCase();
}

const boards = [];
for (const m of mediums) {
  for (const b of (boardsByMedium[m.id] || [])) {
    boards.push({
      id: slug(m.id, b.id),
      name: b.name,
      mediumId: m.id,
      enabled: true,
      order: b.order
    });
  }
}

// Map for convenience: mediumId -> boardIds[]
const boardIdsByMedium = boards.reduce((acc, b) => {
  (acc[b.mediumId] ||= []).push(b.id);
  return acc;
}, {});

// Courses for every board
const courses = [];
for (const m of mediums) {
  const bIds = boardIdsByMedium[m.id] || [];
  for (const boardId of bIds) {
    for (const c of courseNames) {
      courses.push({
        id: slug(boardId, c.id), // unique across project
        name: c.name,
        mediumId: m.id,
        boardId,                 // exactly one of boardId|examId (we use boardId here)
        enabled: true,
        order: c.order
      });
    }
  }
}

// Subjects for every course
const subjectRows = [];
for (const course of courses) {
  for (const s of subjects) {
    subjectRows.push({
      id: slug(course.id, s.id),
      name: s.name,
      courseId: course.id,
      mediumId: course.mediumId,
      boardId: course.boardId,
      enabled: true,
      order: s.order
    });
  }
}

// Chapters (1..25) for every subject
const chapterRows = [];
for (const sub of subjectRows) {
  for (let n = 1; n <= CHAPTER_COUNT; n++) {
    chapterRows.push({
      id: slug(sub.id, `ch-${n}`),
      name: `Chapter ${n}`,
      subjectId: sub.id,
      enabled: true,
      order: n,
      chapterNumber: n,
      durationMinutes: 0
    });
  }
}

// Sets (4 per chapter)
const setRows = [];
for (const ch of chapterRows) {
  for (const s of SET_IDS) {
    setRows.push({
      id: slug(ch.id, s.id),
      name: s.name,
      chapterId: ch.id,
      enabled: true,
      order: s.order,
      difficulty: 'mixed',
      totalQuestions: 1
    });
  }
}

// ---- Write files ---------------------------------------------------------

async function main() {
  await mkdir(REG_DIR, { recursive: true });
  await mkdir(Q_DIR, { recursive: true });

  const writeJson = (name, data) =>
    writeFile(join(REG_DIR, name), JSON.stringify(data, null, 2), 'utf8');

  await writeJson('mediums.json', mediums);
  await writeJson('boards.json',  boards);
  await writeJson('courses.json', courses);
  await writeJson('subjects.json',subjectRows);
  await writeJson('chapters.json',chapterRows);
  await writeJson('quiz_sets.json', setRows);

  // Write one model MCQ file per set
  for (const s of setRows) {
    const file = join(Q_DIR, `${s.id}.json`);
    await writeFile(file, JSON.stringify(oneMCQ(`${s.name} • ${s.id}`), null, 2), 'utf8');
  }

  console.log('✅ Registry built.');
  console.log(`   Mediums:  ${mediums.length}`);
  console.log(`   Boards:   ${boards.length}`);
  console.log(`   Courses:  ${courses.length}`);
  console.log(`   Subjects: ${subjectRows.length}`);
  console.log(`   Chapters: ${chapterRows.length}`);
  console.log(`   Sets:     ${setRows.length}`);
  console.log(`   Questions written to: ${Q_DIR}`);
}

main().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});