export type SubjectFilters = {
  medium: string | '';
  board: string | ''; // treat "" or "All Boards" as not selected
  courseId: string | '';
  examId: string | ''; // treat "" or "All Exams" as not selected
};

export function normalizeBoard(v: string) {
  return v && v !== 'All Boards' ? v : '';
}
export function normalizeExam(v: string) {
  return v && v !== 'All Exams' ? v : '';
}

/** must have medium AND (board OR exam) */
export function filtersReady(f: SubjectFilters) {
  const hasMedium = !!f.medium;
  const hasBoardOrExam = !!normalizeBoard(f.board) || !!normalizeExam(f.examId);
  return hasMedium && hasBoardOrExam;
}
