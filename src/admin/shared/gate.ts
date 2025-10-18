export type Filters = {
  mediumId: string;
  boardId?: string | null;
  examId?: string | null;
  courseId?: string | null;
  subjectId?: string | null;
  chapterId?: string | null;
};

export type Page = 'boards' | 'exams' | 'courses' | 'subjects' | 'chapters' | 'sets';

export function gate(page: Page, f: Filters) {
  const need = [] as string[];

  const hasMedium = !!f.mediumId;
  const hasContext = !!f.boardId || !!f.examId;

  // For all pages, require at least medium selection
  if (!hasMedium) need.push('Medium');

  if (page === 'boards' || page === 'exams') {
    // Only medium required
  }

  if (page === 'courses') {
    if (!hasContext) need.push('Board or Exam');
  }

  if (page === 'subjects') {
    if (!hasContext) need.push('Board or Exam');
    if (!f.courseId) need.push('Course');
  }

  if (page === 'chapters') {
    if (!hasContext) need.push('Board or Exam');
    if (!f.courseId) need.push('Course');
    if (!f.subjectId) need.push('Subject');
  }

  if (page === 'sets') {
    if (!hasContext) need.push('Board or Exam');
    if (!f.courseId) need.push('Course');
    if (!f.subjectId) need.push('Subject');
    if (!f.chapterId) need.push('Chapter');
  }

  return {
    ready: need.length === 0,
    need,
    message: need.length ? `Select ${need.join(' → ')} to view and manage content.` : '',
  };
}
