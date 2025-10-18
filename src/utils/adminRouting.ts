// Admin routing utilities for hierarchical catalog navigation
// Routing contract: /admin/dashboard?tab=<level>&<parent_param>=<parent_id>

export type CatalogLevel = 'mediums' | 'boards' | 'exams' | 'courses' | 'subjects' | 'chapters' | 'quizsets';

export interface CatalogRouteParams {
  tab: CatalogLevel;
  medium?: string;
  board?: string;
  exam?: string;
  course?: string;
  subject?: string;
  chapter?: string;
}

// Filter state for admin catalog (mutually exclusive Board vs Exam)
export interface CatalogFilters {
  mediumId: string;
  boardId?: string | null;   // exactly one of boardId/examId set
  examId?: string | null;
  courseId?: string | null;
  subjectId?: string | null;
}

// Build route path from params
export function buildAdminRoute(params: CatalogRouteParams): string {
  const searchParams = new URLSearchParams();

  // Always include tab
  searchParams.set('tab', params.tab);

  // Add parent parameters based on level
  if (params.medium) searchParams.set('medium', params.medium);
  if (params.board) searchParams.set('board', params.board);
  if (params.exam) searchParams.set('exam', params.exam);
  if (params.course) searchParams.set('course', params.course);
  if (params.subject) searchParams.set('subject', params.subject);
  if (params.chapter) searchParams.set('chapter', params.chapter);

  return `/admin/dashboard?${searchParams.toString()}`;
}

// Parse route params from URL
export function parseAdminRoute(searchParams: URLSearchParams): CatalogRouteParams {
  return {
    tab: (searchParams.get('tab') as CatalogLevel) || 'mediums',
    medium: searchParams.get('medium') || undefined,
    board: searchParams.get('board') || undefined,
    exam: searchParams.get('exam') || undefined,
    course: searchParams.get('course') || undefined,
    subject: searchParams.get('subject') || undefined,
    chapter: searchParams.get('chapter') || undefined,
  };
}

// Navigation helpers for "Open" actions
export function navigateToBoards(mediumId: string): string {
  return buildAdminRoute({ tab: 'boards', medium: mediumId });
}

export function navigateToExams(mediumId: string): string {
  return buildAdminRoute({ tab: 'exams', medium: mediumId });
}

export function navigateToCourses(mediumId: string, boardId?: string, examId?: string): string {
  return buildAdminRoute({
    tab: 'courses',
    medium: mediumId,
    board: boardId,
    exam: examId
  });
}

export function navigateToSubjects(courseId: string): string {
  return buildAdminRoute({ tab: 'subjects', course: courseId });
}

export function navigateToChapters(subjectId: string): string {
  return buildAdminRoute({ tab: 'chapters', subject: subjectId });
}

export function navigateToQuizSets(chapterId: string): string {
  return buildAdminRoute({ tab: 'quizsets', chapter: chapterId });
}

// Breadcrumb generation
export interface BreadcrumbItem {
  label: string;
  path: string;
}

export function generateBreadcrumbs(params: CatalogRouteParams): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', path: '/admin/dashboard' }
  ];

  // Add breadcrumbs based on current level and available params
  switch (params.tab) {
    case 'boards':
      if (params.medium) {
        breadcrumbs.push({
          label: 'Mediums',
          path: buildAdminRoute({ tab: 'mediums' })
        });
        breadcrumbs.push({
          label: 'Boards',
          path: buildAdminRoute({ tab: 'boards', medium: params.medium })
        });
      }
      break;

    case 'exams':
      if (params.medium) {
        breadcrumbs.push({
          label: 'Mediums',
          path: buildAdminRoute({ tab: 'mediums' })
        });
        breadcrumbs.push({
          label: 'Exams',
          path: buildAdminRoute({ tab: 'exams', medium: params.medium })
        });
      }
      break;

    case 'courses':
      if (params.medium) {
        breadcrumbs.push({
          label: 'Mediums',
          path: buildAdminRoute({ tab: 'mediums' })
        });

        if (params.board) {
          breadcrumbs.push({
            label: 'Boards',
            path: buildAdminRoute({ tab: 'boards', medium: params.medium })
          });
          breadcrumbs.push({
            label: 'Courses',
            path: buildAdminRoute({ tab: 'courses', medium: params.medium, board: params.board })
          });
        } else if (params.exam) {
          breadcrumbs.push({
            label: 'Exams',
            path: buildAdminRoute({ tab: 'exams', medium: params.medium })
          });
          breadcrumbs.push({
            label: 'Courses',
            path: buildAdminRoute({ tab: 'courses', medium: params.medium, exam: params.exam })
          });
        }
      }
      break;

    case 'subjects':
      // For subjects, we need to reconstruct the path through courses
      // This would require additional logic to fetch course data and determine board/exam
      breadcrumbs.push({
        label: 'Courses',
        path: buildAdminRoute({ tab: 'courses' })
      });
      breadcrumbs.push({
        label: 'Subjects',
        path: buildAdminRoute({ tab: 'subjects', course: params.course })
      });
      break;

    case 'chapters':
      breadcrumbs.push({
        label: 'Subjects',
        path: buildAdminRoute({ tab: 'subjects' })
      });
      breadcrumbs.push({
        label: 'Chapters',
        path: buildAdminRoute({ tab: 'chapters', subject: params.subject })
      });
      break;

    case 'quizsets':
      breadcrumbs.push({
        label: 'Chapters',
        path: buildAdminRoute({ tab: 'chapters' })
      });
      breadcrumbs.push({
        label: 'Quiz Sets',
        path: buildAdminRoute({ tab: 'quizsets', chapter: params.chapter })
      });
      break;
  }

  return breadcrumbs;
}


// Filter state management (mutually exclusive Board vs Exam)
export function createInitialFilters(): CatalogFilters {
  return {
    mediumId: '',
    boardId: null,
    examId: null,
    courseId: null,
    subjectId: null,
  };
}

// Filter update helpers (maintain mutually exclusive Board/Exam constraint)
export function pickMedium(filters: CatalogFilters, mediumId: string): CatalogFilters {
  return {
    mediumId,
    boardId: null,
    examId: null,
    courseId: null,
    subjectId: null,
  };
}

export function pickBoard(filters: CatalogFilters, boardId: string | null): CatalogFilters {
  return {
    ...filters,
    boardId,
    examId: null, // Clear exam when board is selected
    courseId: null, // Reset deeper selections
    subjectId: null,
  };
}

export function pickExam(filters: CatalogFilters, examId: string | null): CatalogFilters {
  return {
    ...filters,
    examId,
    boardId: null, // Clear board when exam is selected
    courseId: null, // Reset deeper selections
    subjectId: null,
  };
}

export function pickCourse(filters: CatalogFilters, courseId: string | null): CatalogFilters {
  return {
    ...filters,
    courseId,
    subjectId: null, // Reset deeper selections
  };
}

export function pickSubject(filters: CatalogFilters, subjectId: string | null): CatalogFilters {
  return {
    ...filters,
    subjectId,
  };
}

// Convert filters to route params
export function filtersToRouteParams(filters: CatalogFilters, tab: CatalogLevel): CatalogRouteParams {
  return {
    tab,
    medium: filters.mediumId || undefined,
    board: filters.boardId || undefined,
    exam: filters.examId || undefined,
    course: filters.courseId || undefined,
    subject: filters.subjectId || undefined,
  };
}

// Convert route params to filters
export function routeParamsToFilters(params: CatalogRouteParams): CatalogFilters {
  return {
    mediumId: params.medium || '',
    boardId: params.board || null,
    examId: params.exam || null,
    courseId: params.course || null,
    subjectId: params.subject || null,
  };
}

// Validation helpers
export function canListBoards(filters: CatalogFilters): boolean {
  return !!filters.mediumId;
}

export function canListExams(filters: CatalogFilters): boolean {
  return !!filters.mediumId;
}

export function canListCourses(filters: CatalogFilters): boolean {
  return !!filters.mediumId && (!!filters.boardId || !!filters.examId);
}

export function canListSubjects(filters: CatalogFilters): boolean {
  return !!filters.courseId;
}

export function canListChapters(filters: CatalogFilters): boolean {
  return !!filters.subjectId;
}

export function canListQuizSets(filters: CatalogFilters): boolean {
  return !!filters.subjectId; // Quiz sets are listed for a subject (through chapters)
}

export function canNavigateToBoards(params: CatalogRouteParams): boolean {
  return !!params.medium;
}

export function canNavigateToExams(params: CatalogRouteParams): boolean {
  return !!params.medium;
}

export function canNavigateToCourses(params: CatalogRouteParams): boolean {
  return !!params.medium && (!!params.board || !!params.exam);
}

export function canNavigateToSubjects(params: CatalogRouteParams): boolean {
  return !!params.course;
}

export function canNavigateToChapters(params: CatalogRouteParams): boolean {
  return !!params.subject;
}

export function canNavigateToQuizSets(params: CatalogRouteParams): boolean {
  return !!params.chapter;
}

export default {
  buildAdminRoute,
  parseAdminRoute,
  navigateToBoards,
  navigateToExams,
  navigateToCourses,
  navigateToSubjects,
  navigateToChapters,
  navigateToQuizSets,
  generateBreadcrumbs,
  createInitialFilters,
  pickMedium,
  pickBoard,
  pickExam,
  pickCourse,
  pickSubject,
  filtersToRouteParams,
  routeParamsToFilters,
  canListBoards,
  canListExams,
  canListCourses,
  canListSubjects,
  canListChapters,
  canListQuizSets,
  canNavigateToBoards,
  canNavigateToExams,
  canNavigateToCourses,
  canNavigateToSubjects,
  canNavigateToChapters,
  canNavigateToQuizSets
};