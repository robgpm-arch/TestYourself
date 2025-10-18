export type CourseFilters = {
  medium: string | '';
  board: string | '';
  examId: string | '';
};

export const normBoard = (v: string) => (v && v !== 'All Boards' ? v : '');
export const normExam = (v: string) => (v && v !== 'All Exams' ? v : '');

export function filtersReady(f: CourseFilters) {
  return !!f.medium && (!!normBoard(f.board) || !!normExam(f.examId));
}
