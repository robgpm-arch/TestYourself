import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { signOutAdmin } from '../auth/signOutAdmin';
import Layout from '../components/Layout';
import Card from '../components/Card';
import ResponsiveGrid from '../components/ResponsiveGrid';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import AdminCatalogService, { CatalogEntity } from '../services/adminCatalogService';
import { auth } from '../config/firebase';
import {
  syncScreensToFirestore,
  syncBoardsToFirestore,
  syncMediumsToFirestore,
  syncCoursesToFirestore,
  syncSubjectsToFirestore,
  syncChaptersToFirestore,
  syncQuizSetsToFirestore,
  syncExamsToFirestore,
  syncLeaderboardsToFirestore
} from '../utils/syncScreens';
import { loadTheme, uploadAsset } from '../design/api';
import type { ThemeDoc, ScreenStyle } from '../design/types';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import app from '../config/firebase';
import { indexAssets, listenAssetManifest } from '../admin/design/assetsApi';
import { listenThemes } from '../admin/design/themesApi';
import { listenExams, Exam } from '../admin/subjects/examsApi';
import { SubjectFilters, filtersReady, normalizeBoard, normalizeExam } from '../utils/subjectFilters';
import { SubjectNameSelect } from '../admin/subjects/SubjectNameSelect';
import { EmojiSelect } from '../admin/shared/EmojiSelect';
import { ColorSelect } from '../admin/shared/ColorSelect';
import SubjectCard from '../admin/subjects/SubjectCard';
import SubjectFormModal from '../admin/subjects/SubjectFormModal';
import {
  createSubject, updateSubject, deleteSubject,
  duplicateSubject, toggleSubjectEnabled, SubjectInput
} from '../services/adminCatalogService';
import { CoursePicker } from '../admin/courses/CoursePicker';
import { SlugSelect } from '../admin/components/SlugSelect';
import { LevelSelect } from '../admin/components/LevelSelect';
import { ThumbnailSelect } from '../admin/components/ThumbnailSelect';
import SeoCard from '../admin/seo/SeoCard';
import SyncCenterCard from '../admin/sync/SyncCenterCard';
import { explainFirebaseError, type Explained } from '../admin/lib/explainFirebaseError';
import type { EmojiOpt } from '../admin/shared/options';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { gate, type Filters, type Page } from '../admin/shared/gate';
import {
  CatalogMedium,
  CatalogBoard,
  CatalogCourse,
  CatalogSubject,
  CatalogChapter,
  CatalogQuizSet,
  AppScreen,
  LeaderboardConfig,
  CatalogExam,
  COLLECTIONS
} from '../types/firebase';
import type { Timestamp } from 'firebase/firestore';

type AdminTab =
  | 'mediums'
  | 'boards'
  | 'courses'
  | 'subjects'
  | 'chapters'
  | 'quizSets'
  | 'screens'
  | 'leaderboards'
  | 'exams'
  | 'design'
  | 'seo'
  | 'sync';

interface ModalState {
  tab: AdminTab;
  mode: 'create' | 'edit';
  item?: CatalogEntity;
}

type FormFieldType = 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'subjectName' | 'emoji' | 'color' | 'course' | 'slug' | 'levelSelect' | 'thumbnailSelect';

interface FormFieldConfig {
  id: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  helperText?: string;
  disabled?: boolean;
}

const isValidAdminTab = (value: string | null): value is AdminTab =>
  Boolean(value && Object.prototype.hasOwnProperty.call(TAB_LABELS, value));

const DEFAULT_ORDER = 1000;

const TAB_LABELS: Record<AdminTab, { plural: string; singular: string; icon: string; description: string }> = {
  mediums: {
    plural: 'Mediums',
    singular: 'Medium',
    icon: '🗣️',
    description: 'Languages and education mediums for course catalogs'
  },
  boards: {
    plural: 'Boards',
    singular: 'Board',
    icon: '🏫',
    description: 'Education boards associated with each medium'
  },
  courses: {
    plural: 'Courses',
    singular: 'Course',
    icon: '📚',
    description: 'Course tracks and preparation programs'
  },
  subjects: {
    plural: 'Subjects',
    singular: 'Subject',
    icon: '📘',
    description: 'Subject catalog under each course'
  },
  chapters: {
    plural: 'Chapters',
    singular: 'Chapter',
    icon: '🧩',
    description: 'Chapter progression for the selected subject'
  },
  quizSets: {
    plural: 'Quiz Sets',
    singular: 'Quiz Set',
    icon: '❓',
    description: 'Assessments mapped to each chapter'
  },
  screens: {
    plural: 'App Screens',
    singular: 'Screen',
    icon: '🗂️',
    description: 'Front-end screens and feature toggles'
  },
  design: {
    plural: 'Design System',
    singular: 'Design',
    icon: '🎨',
    description: 'Live-editable themes, backgrounds, and visual styles'
  },
  leaderboards: {
    plural: 'Leaderboards',
    singular: 'Leaderboard',
    icon: '🏆',
    description: 'Leaderboard definitions and scoring rules'
  },
  exams: {
    plural: 'Exams',
    singular: 'Exam',
    icon: '📝',
    description: 'Competitive/entrance exams and certifications'
  },
  seo: {
    plural: 'SEO & Discovery',
    singular: 'SEO',
    icon: '🔍',
    description: 'Manage meta titles, descriptions, and search engine settings'
  },
  sync: {
    plural: 'Sync Center',
    singular: 'Sync',
    icon: '🔄',
    description: 'Run seeding/backfills and scan assets'
  }
};

const COLLECTION_MAP: Record<AdminTab, typeof COLLECTIONS[keyof typeof COLLECTIONS]> = {
  mediums: COLLECTIONS.MEDIUMS,
  boards: COLLECTIONS.BOARDS,
  courses: COLLECTIONS.COURSES,
  subjects: COLLECTIONS.SUBJECTS,
  chapters: COLLECTIONS.CHAPTERS,
  quizSets: COLLECTIONS.QUIZ_SETS,
  screens: COLLECTIONS.SCREENS,
  leaderboards: COLLECTIONS.LEADERBOARD_CONFIGS,
  exams: COLLECTIONS.EXAMS,
  design: COLLECTIONS.SCREENS, // Placeholder, design tab doesn't use standard collections
  seo: COLLECTIONS.SCREENS, // Placeholder, seo tab doesn't use standard collections
  sync: COLLECTIONS.SCREENS // Placeholder, sync tab doesn't use standard collections
};

const PREREQUISITE_MESSAGES: Partial<Record<AdminTab, string>> = {
  boards: 'Create at least one medium before adding a board.',
  courses: 'Create at least one board before adding a course.',
  subjects: 'Create at least one course before adding a subject.',
  chapters: 'Create at least one subject before adding a chapter.',
  quizSets: 'Create at least one chapter before adding a quiz set.'
};

const formatTimestamp = (value: unknown): string => {
  if (!value) {
    return '—';
  }

  try {
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleString();
      }
    }

    if (typeof value === 'object' && value !== null && 'toDate' in value) {
      const date = (value as Timestamp).toDate();
      return date.toLocaleString();
    }
  } catch (error) {
    console.warn('Unable to format timestamp', error);
  }

  return '—';
};

const getItemDisplayName = (tab: AdminTab, item: CatalogEntity): string => {
  if ('name' in item && typeof item.name === 'string') {
    return item.name;
  }

  if (tab === 'leaderboards') {
    return (item as LeaderboardConfig).title;
  }

  if (tab === 'exams') {
    return (item as CatalogExam).code;
  }

  return (item as { id: string }).id;
};

const parseCommaSeparated = (value: unknown): string[] | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const parts = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length ? parts : undefined;
};

const stringifyList = (value?: string[] | null): string => {
  if (!value?.length) {
    return '';
  }
  return value.join(', ');
};

const getCurrentUserId = () => auth.currentUser?.uid ?? undefined;

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function validateCourse(d: {
  name?: string; slug?: string; mediumId?: string;
  boardId?: string; examId?: string;
}) {
  const errors: string[] = [];
  if (!d.name?.trim()) errors.push("Name is required.");
  if (!d.slug?.match(/^[a-z0-9-]{1,80}$/)) errors.push("Slug must be URL-friendly (a–z, 0–9, hyphen).");
  if (!d.mediumId) errors.push("Medium is required.");
  if (!(d.boardId || d.examId)) errors.push("Select Board or Exam.");
  return errors;
}

// Helper to remove undefined values recursively
function stripUndefined<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(stripUndefined) as unknown as T;
  const out: any = {};
  Object.entries(obj as any).forEach(([k, v]) => {
    if (v !== undefined) out[k] = stripUndefined(v);
  });
  return out;
}

// Hook to read active tab from URL
function useActiveTab() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  return params.get('tab') ?? 'mediums';
}

// Function to set tab in URL
function setTab(navigate: ReturnType<typeof useNavigate>, tab: string) {
  navigate(`/admin/dashboard?tab=${tab}`, { replace: false });
}

// Hook to read filter state from URL
function useUrlFilters() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  return {
    medium: params.get('medium') || '',
    board: params.get('board') || '',
    exam: params.get('exam') || '',
    course: params.get('course') || '',
    subject: params.get('subject') || '',
    chapter: params.get('chapter') || ''
  };
}

// Function to update URL filters
function updateUrlFilters(navigate: ReturnType<typeof useNavigate>, updates: Partial<{
  medium: string;
  board: string;
  exam: string;
  course: string;
  subject: string;
  chapter: string;
}>) {
  const currentUrl = new URL(window.location.href);
  const params = currentUrl.searchParams;

  Object.entries(updates).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  });

  navigate(`${currentUrl.pathname}?${params.toString()}`, { replace: false });
}

// AdminTile component for tab navigation
type TileProps = {
  tab: string;
  activeTab: AdminTab;
  title: string;
  subtitle: string;
  count?: number;
  icon?: React.ReactNode;
};

function AdminTile({ tab, activeTab, title, subtitle, count = 0, icon }: TileProps) {
  const navigate = useNavigate();
  const isActive = activeTab === tab;

  return (
    <button
      type="button"
      onClick={() => setTab(navigate, tab)}
      className={[
        'w-full text-left rounded-2xl border transition',
        'p-6 focus:outline-none focus:ring-2 focus:ring-offset-2',
        isActive
          ? 'border-blue-500 ring-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 bg-white',
      ].join(' ')}
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${tab}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <div className="text-2xl font-bold">{count}</div>
      </div>
      <p className="text-gray-500">{subtitle}</p>
    </button>
  );
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const activeTab = useActiveTab() as AdminTab;
  const urlFilters = useUrlFilters();
  const isAdmin = useIsAdmin();
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [formError, setFormError] = useState<Explained | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyState, setBusyState] = useState<{ id: string; action: 'toggle' | 'delete' | 'duplicate' | 'sync' } | null>(null);


  const [mediums, setMediums] = useState<CatalogMedium[]>([]);
  const [boards, setBoards] = useState<CatalogBoard[]>([]);
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [subjects, setSubjects] = useState<CatalogSubject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [chapters, setChapters] = useState<CatalogChapter[]>([]);
  const [quizSets, setQuizSets] = useState<CatalogQuizSet[]>([]);
  const [screens, setScreens] = useState<AppScreen[]>([]);
  const [leaderboardConfigs, setLeaderboardConfigs] = useState<LeaderboardConfig[]>([]);
  const [exams, setExams] = useState<CatalogExam[]>([]);

  const [themes, setThemes] = useState<ThemeDoc[]>([]);
  const [currentTheme, setCurrentTheme] = useState<ThemeDoc | null>(null);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [themeJson, setThemeJson] = useState('');
  const [themeCount, setThemeCount] = useState(0);
  const [assetCount, setAssetCount] = useState(0);

  const [examOptions, setExamOptions] = useState<Exam[]>([]);

  // Subject modal state
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  // Sync filter state with URL
  const [selectedMediumId, setSelectedMediumId] = useState(urlFilters.medium);
  const [selectedBoardId, setSelectedBoardId] = useState(urlFilters.board);
  const [selectedExamId, setSelectedExamId] = useState(urlFilters.exam);
  const [selectedCourseId, setSelectedCourseId] = useState(urlFilters.course);
  const [selectedSubjectId, setSelectedSubjectId] = useState(urlFilters.subject);
  const [selectedChapterId, setSelectedChapterId] = useState(urlFilters.chapter);
  const [subjectFilters, setSubjectFilters] = useState<SubjectFilters>({
    medium: '',
    board: '',
    courseId: '',
    examId: ''
  });

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    const subscribe = <T extends CatalogEntity>(
      collectionName: typeof COLLECTIONS[keyof typeof COLLECTIONS],
      setter: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
      try {
        const unsubscribe = AdminCatalogService.subscribeToCollection<T>(collectionName, (items) => {
          setter(items);
        });
        unsubscribers.push(unsubscribe);
      } catch (error) {
        console.error(`Failed to subscribe to ${collectionName}`, error);
      }
    };

    subscribe<CatalogMedium>(COLLECTIONS.MEDIUMS, setMediums);
    subscribe<CatalogBoard>(COLLECTIONS.BOARDS, setBoards);
    subscribe<CatalogCourse>(COLLECTIONS.COURSES, setCourses);
    // Subjects loaded dynamically based on course selection
    // subscribe<CatalogSubject>(COLLECTIONS.SUBJECTS, setSubjects);
    subscribe<CatalogChapter>(COLLECTIONS.CHAPTERS, setChapters);
    subscribe<CatalogQuizSet>(COLLECTIONS.QUIZ_SETS, setQuizSets);
    subscribe<AppScreen>(COLLECTIONS.SCREENS, setScreens);
    subscribe<LeaderboardConfig>(COLLECTIONS.LEADERBOARD_CONFIGS, setLeaderboardConfigs);
    subscribe<CatalogExam>(COLLECTIONS.EXAMS, setExams);

    // Load themes and assets
    const themeUnsub = listenThemes((rows, count) => {
      setThemes(rows);
      setThemeCount(count);
      if (rows.length > 0 && !currentTheme) {
        setCurrentTheme(rows[0]);
      }
    });

    const assetUnsub = listenAssetManifest((items) => {
      setAssetCount(items.length);
    });

    const examUnsub = listenExams((rows) => {
      setExamOptions(rows);
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      themeUnsub();
      assetUnsub();
      examUnsub();
    };
  }, []);

  // Custom subjects loader based on course selection
  useEffect(() => {
    let ignore = false;

    (async () => {
      // Gate: must have Medium + (Board or Exam) + Course selected
      if (!selectedMediumId || (!selectedBoardId && !selectedExamId) || !selectedCourseId) {
        setSubjects([]);
        return;
      }

      setSubjectsLoading(true);

      const { collection, query: queryFn, where, orderBy, getDocs } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');

      const base = queryFn(
        collection(db, "subjects"),
        where("courseId", "==", selectedCourseId)
      );

      try {
        // Try ordered path first
        const snap = await getDocs(queryFn(base, orderBy("order")));
        if (ignore) return;
        const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setSubjects(
          rows
            .filter(r => r.enabled !== false && r.isVisible !== false && r.active !== false)
            .map(r => ({ id: r.id, name: r.name ?? r.id, ...r }))
        );
        console.log("[Subjects] found (indexed)", rows.length, { selectedCourseId });
      } catch (err) {
        // Fallback: no index or order field
        console.warn("[Subjects] fallback:", err);
        const snap = await getDocs(base);
        if (ignore) return;
        const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setSubjects(
          rows
            .filter(r => r.enabled !== false && r.isVisible !== false && r.active !== false)
            .sort((a,b)=> String(a.name??a.id).localeCompare(String(b.name??b.id)))
            .map(r => ({ id: r.id, name: r.name ?? r.id, ...r }))
        );
        console.log("[Subjects] found (fallback)", rows.length, { selectedCourseId });
      } finally {
        setSubjectsLoading(false);
      }
    })();

    return () => { ignore = true; };
  }, [selectedMediumId, selectedBoardId, selectedExamId, selectedCourseId]);

  // Sync URL filters with state
  useEffect(() => {
    setSelectedMediumId(urlFilters.medium);
    setSelectedBoardId(urlFilters.board);
    setSelectedExamId(urlFilters.exam);
    setSelectedCourseId(urlFilters.course);
    setSelectedSubjectId(urlFilters.subject);
    setSelectedChapterId(urlFilters.chapter);
  }, [urlFilters]);

  useEffect(() => {
    if (!selectedBoardId && !selectedExamId) {
      setSelectedCourseId('');
      setSelectedSubjectId('');
      setSelectedChapterId('');
    }
  }, [selectedBoardId, selectedExamId]);

  useEffect(() => {
    setSelectedSubjectId('');
    setSelectedChapterId('');
  }, [selectedCourseId]);

  useEffect(() => {
    setSelectedChapterId('');
  }, [selectedSubjectId]);

  // Special handling for subjects: clear list when filters not ready
  useEffect(() => {
    if (activeTab === 'subjects') {
      const filters: Filters = {
        mediumId: subjectFilters.medium,
        boardId: subjectFilters.board || null,
        examId: subjectFilters.examId || null,
        courseId: subjectFilters.courseId || null,
      };
      const { ready } = gate('subjects', filters);
      if (!ready) {
        setSubjects([]);
      }
    }
  }, [activeTab, subjectFilters, gate]);

  const mediumLookup = useMemo(() => new Map(mediums.map((item) => [item.id, item])), [mediums]);
  const boardLookup = useMemo(() => new Map(boards.map((item) => [item.id, item])), [boards]);
  const courseLookup = useMemo(() => new Map(courses.map((item) => [item.id, item])), [courses]);
  const subjectLookup = useMemo(() => new Map(subjects.map((item) => [item.id, item])), [subjects]);
  const chapterLookup = useMemo(() => new Map(chapters.map((item) => [item.id, item])), [chapters]);

  const filteredBoards = useMemo(() => {
    if (!selectedMediumId) {
      return boards;
    }
    return boards.filter((board) => board.mediumId === selectedMediumId);
  }, [boards, selectedMediumId]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (selectedMediumId && course.mediumId && course.mediumId !== selectedMediumId) {
        return false;
      }

      // Course must match at least one of the selected filters (board or exam)
      const courseBoardId = course.boardId;
      const courseExamId = (course as any).examId;

      if (selectedBoardId && selectedExamId) {
        // If both filters are selected, course must match at least one
        if (courseBoardId !== selectedBoardId && courseExamId !== selectedExamId) {
          return false;
        }
      } else if (selectedBoardId) {
        // Only board filter selected
        if (courseBoardId !== selectedBoardId) {
          return false;
        }
      } else if (selectedExamId) {
        // Only exam filter selected
        if (courseExamId !== selectedExamId) {
          return false;
        }
      } else {
        // No board/exam filter selected - this shouldn't happen if gate is working
        return false;
      }

      return true;
    });
  }, [courses, selectedMediumId, selectedBoardId, selectedExamId]);

  const filteredSubjects = useMemo(() => {
    // Subjects are now loaded dynamically by courseId, so just return them
    return subjects;
  }, [subjects]);

  const filteredChapters = useMemo(() => {
    return chapters.filter((chapter) => {
      if (selectedSubjectId && chapter.subjectId !== selectedSubjectId) {
        return false;
      }

      const subject = subjectLookup.get(chapter.subjectId);
      if (!subject) return false;

      if (selectedCourseId && subject.courseId !== selectedCourseId) {
        return false;
      }

      const course = courseLookup.get(subject.courseId);
      if (!course) return false;

      if (selectedMediumId && course.mediumId && course.mediumId !== selectedMediumId) {
        return false;
      }

      // Chapter must match the board/exam context from its parent course
      const courseBoardId = course.boardId;
      const courseExamId = (course as any).examId;

      if (selectedBoardId && selectedExamId) {
        // If both filters are selected, chapter must match at least one
        if (courseBoardId !== selectedBoardId && courseExamId !== selectedExamId) {
          return false;
        }
      } else if (selectedBoardId) {
        // Only board filter selected
        if (courseBoardId !== selectedBoardId) {
          return false;
        }
      } else if (selectedExamId) {
        // Only exam filter selected
        if (courseExamId !== selectedExamId) {
          return false;
        }
      }

      return true;
    });
  }, [chapters, selectedSubjectId, selectedCourseId, selectedBoardId, selectedExamId, selectedMediumId, subjectLookup, courseLookup]);

  const filteredQuizSets = useMemo(() => {
    return quizSets.filter((quizSet) => {
      if (selectedChapterId && quizSet.chapterId !== selectedChapterId) {
        return false;
      }

      const chapter = chapterLookup.get(quizSet.chapterId);
      if (!chapter) return false;

      const subject = subjectLookup.get(chapter.subjectId);
      if (!subject) return false;

      if (selectedSubjectId && subject.id !== selectedSubjectId) {
        return false;
      }

      if (selectedCourseId && subject.courseId !== selectedCourseId) {
        return false;
      }

      const course = courseLookup.get(subject.courseId);
      if (!course) return false;

      if (selectedMediumId && course.mediumId && course.mediumId !== selectedMediumId) {
        return false;
      }

      // QuizSet must match the board/exam context from its parent course
      const courseBoardId = course.boardId;
      const courseExamId = (course as any).examId;

      if (selectedBoardId && selectedExamId) {
        // If both filters are selected, quizSet must match at least one
        if (courseBoardId !== selectedBoardId && courseExamId !== selectedExamId) {
          return false;
        }
      } else if (selectedBoardId) {
        // Only board filter selected
        if (courseBoardId !== selectedBoardId) {
          return false;
        }
      } else if (selectedExamId) {
        // Only exam filter selected
        if (courseExamId !== selectedExamId) {
          return false;
        }
      }

      return true;
    });
  }, [quizSets, selectedChapterId, selectedSubjectId, selectedCourseId, selectedBoardId, selectedExamId, selectedMediumId, chapterLookup, subjectLookup, courseLookup]);

  const filteredLeaderboardConfigs = useMemo(() => {
    if (!selectedSubjectId) {
      return leaderboardConfigs;
    }
    const selectedSubject = subjectLookup.get(selectedSubjectId);
    if (!selectedSubject) {
      return leaderboardConfigs;
    }
    const relatedCourse = courseLookup.get(selectedSubject.courseId);

    return leaderboardConfigs.filter((config) => {
      if (config.subject && config.subject !== selectedSubjectId) {
        return false;
      }
      if (selectedCourseId && relatedCourse?.id !== selectedCourseId) {
        return false;
      }
      return true;
    });
  }, [leaderboardConfigs, selectedSubjectId, selectedCourseId, subjectLookup, courseLookup]);

  const filteredExams = useMemo(() => {
    if (!selectedMediumId) {
      return exams;
    }
    return exams.filter((exam) => exam.mediumId === selectedMediumId);
  }, [exams, selectedMediumId]);

  const counts = useMemo(
    () => ({
      mediums: mediums.length,
      boards: boards.length,
      courses: courses.length,
      subjects: subjects.length,
      chapters: chapters.length,
      quizSets: quizSets.length,
      screens: screens.length,
      leaderboards: leaderboardConfigs.length,
      exams: exams.length,
      design: themeCount,
      seo: 0, // SEO doesn't have a count
      sync: 0 // Sync Center doesn't have a count
    }),
    [mediums.length, boards.length, courses.length, subjects.length, chapters.length, quizSets.length, screens.length, leaderboardConfigs.length, exams.length, themeCount]
  );

  const tabCards = useMemo(
    () =>
      (Object.keys(TAB_LABELS) as AdminTab[]).map((tab) => ({
        id: tab,
        label: TAB_LABELS[tab].plural,
        icon: TAB_LABELS[tab].icon,
        description: TAB_LABELS[tab].description,
        count: counts[tab]
      })),
    [counts]
  );

  const prerequisitesMet = useCallback(
    (tab: AdminTab) => {
      switch (tab) {
        case 'boards':
          return mediums.length > 0;
        case 'courses':
          return boards.length > 0;
        case 'subjects':
          return courses.length > 0;
        case 'chapters':
          return subjects.length > 0;
        case 'quizSets':
          return chapters.length > 0;
        default:
          return true;
      }
    },
    [mediums.length, boards.length, courses.length, subjects.length, chapters.length]
  );

  const clearFilters = () => {
    updateUrlFilters(navigate, {
      medium: '',
      board: '',
      exam: '',
      course: '',
      subject: '',
      chapter: ''
    });
    setSubjectFilters({ medium: '', board: '', courseId: '', examId: '' });
  };

  const handleSignOut = async () => {
    try {
      await signOutAdmin();
      navigate('/admin/login', { replace: true });
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  };

  const handleMediumFilterChange = useCallback((value: string) => {
    updateUrlFilters(navigate, {
      medium: value,
      board: '',
      course: '',
      subject: '',
      chapter: ''
    });
  }, [navigate]);

  const handleBoardFilterChange = useCallback((value: string) => {
    updateUrlFilters(navigate, {
      board: value,
      course: '',
      subject: '',
      chapter: ''
    });
  }, [navigate]);

  const handleCourseFilterChange = useCallback((value: string) => {
    updateUrlFilters(navigate, {
      course: value,
      subject: '',
      chapter: ''
    });
  }, [navigate]);

  const handleSubjectFilterChange = useCallback((value: string) => {
    updateUrlFilters(navigate, {
      subject: value,
      chapter: ''
    });
  }, [navigate]);

  const handleExamFilterChange = useCallback((value: string) => {
    updateUrlFilters(navigate, {
      exam: value,
      course: '',
      subject: '',
      chapter: ''
    });
  }, [navigate]);

  const handleChapterFilterChange = useCallback((value: string) => {
    updateUrlFilters(navigate, { chapter: value });
  }, [navigate]);

  const getItemsForTab = (tab: AdminTab): CatalogEntity[] => {
    switch (tab) {
      case 'mediums':
        return mediums;
      case 'boards':
        return filteredBoards;
      case 'courses':
        return filteredCourses;
      case 'subjects':
        return filteredSubjects;
      case 'chapters':
        return filteredChapters;
      case 'quizSets':
        return filteredQuizSets;
      case 'screens':
        return screens;
      case 'leaderboards':
        return filteredLeaderboardConfigs;
      case 'exams':
        return filteredExams;
      default:
        return [];
    }
  };

  const getDefaultFormValues = useCallback(
    (tab: AdminTab, item?: CatalogEntity) => {
      switch (tab) {
        case 'mediums': {
          const medium = item as CatalogMedium | undefined;
          return {
            name: medium?.name ?? '',
            description: medium?.description ?? '',
            code: medium?.code ?? '',
            order: medium?.order?.toString() ?? '',
            isVisible: medium?.isVisible ?? true
          };
        }
        case 'boards': {
          const board = item as CatalogBoard | undefined;
          return {
            name: board?.name ?? '',
            description: board?.description ?? '',
            region: board?.region ?? '',
            code: board?.code ?? '',
            mediumId: board?.mediumId ?? selectedMediumId,
            order: board?.order?.toString() ?? '',
            isVisible: board?.isVisible ?? true
          };
        }
        case 'courses': {
            const course = item as CatalogCourse | undefined;
            return {
              name: course?.name ?? '',
              description: course?.description ?? '',
              slug: course?.slug ?? '',
              level: course?.level ?? '',
              thumbnail: course?.thumbnail ?? '',
              mediumId: course?.mediumId ?? selectedMediumId ?? '',
              boardId: course?.boardId ?? selectedBoardId ?? '',
              examId: (course as any)?.examId ?? '',
              order: course?.order?.toString() ?? '',
              isVisible: course?.isVisible ?? true
            };
          }
        case 'subjects': {
           const subject = item as CatalogSubject | undefined;
           const examId = (subject as any)?.examId ?? '';
           const examName = examId ? examOptions.find(e => e.id === examId)?.name || '' : '';
           return {
             name: subject?.name ?? '',
             description: subject?.description ?? '',
             emoji: (subject as any)?.emojiId ? {
               id: (subject as any).emojiId,
               name: (subject as any).emojiName,
               char: (subject as any).emoji
             } : null,
             color: (subject as any)?.brandColorId ? {
               id: (subject as any).brandColorId,
               hex: (subject as any).brandColorHex
             } : null,
             course: (subject as any)?.courseId ? {
               id: (subject as any).courseId,
               name: (subject as any).courseName || 'Loading...'
             } : null,
             cardKind: (subject as any)?.cardKind ?? 'grid',
             cardSize: (subject as any)?.cardSize ?? 'large',
             examId,
             order: subject?.order?.toString() ?? '',
             isVisible: subject?.isVisible ?? true
           };
         }
        case 'chapters': {
          const chapter = item as CatalogChapter | undefined;
          return {
            name: chapter?.name ?? '',
            description: chapter?.description ?? '',
            subjectId: chapter?.subjectId ?? selectedSubjectId,
            chapterNumber: chapter?.chapterNumber?.toString() ?? '',
            durationMinutes: chapter?.durationMinutes?.toString() ?? '',
            prerequisites: stringifyList(chapter?.prerequisites ?? []),
            order: chapter?.order?.toString() ?? '',
            isVisible: chapter?.isVisible ?? true
          };
        }
        case 'quizSets': {
          const quizSet = item as CatalogQuizSet | undefined;
          return {
            name: quizSet?.name ?? '',
            description: quizSet?.description ?? '',
            chapterId: quizSet?.chapterId ?? selectedChapterId,
            difficulty: quizSet?.difficulty ?? 'medium',
            totalQuestions: quizSet?.totalQuestions?.toString() ?? '',
            durationMinutes: quizSet?.durationMinutes?.toString() ?? '',
            tags: stringifyList(quizSet?.tags ?? []),
            autoRunEnabled: quizSet?.autoRunConfig?.enabled ?? false,
            autoRunReadAnswer: quizSet?.autoRunConfig?.readCorrectAnswer ?? true,
            autoRunReadExplanation: quizSet?.autoRunConfig?.readExplanation ?? false,
            autoRunDelaySeconds: quizSet?.autoRunConfig?.delaySeconds?.toString() ?? '5',
            autoRunVoice: quizSet?.autoRunConfig?.voice ?? 'default',
            autoRunSubscriberOnly: quizSet?.autoRunConfig?.subscriberOnly ?? false,
            order: quizSet?.order?.toString() ?? '',
            isVisible: quizSet?.isVisible ?? true
          };
        }
        case 'screens': {
           const screen = item as AppScreen | undefined;
           const style = (screen as any)?.style as ScreenStyle | undefined;
           return {
             name: screen?.name ?? '',
             path: screen?.path ?? '',
             description: screen?.description ?? '',
             category: screen?.category ?? '',
             roles: stringifyList(screen?.roles ?? []),
             order: screen?.order?.toString() ?? '',
             isVisible: screen?.isVisible ?? true,
             // Design
             designTheme: style?.theme ?? 'default',
             designGradient: style?.gradient ?? null,
             designBgImage: style?.bgImage ?? null,
             designBgMode: style?.bgMode ?? 'cover',
             designBgBlend: style?.bgBlend ?? 'normal',
             designOverlay: style?.overlay ?? null,
             designCardVariant: style?.cardVariant ?? 'elevated',
             designContainerMaxWidth: style?.container?.maxWidth ?? 1100,
             designContainerPadding: style?.container?.padding ?? 24,
             designContainerGap: style?.container?.gap ?? 24
           };
         }
        case 'leaderboards': {
          const leaderboard = item as LeaderboardConfig | undefined;
          return {
            title: leaderboard?.title ?? '',
            description: leaderboard?.description ?? '',
            period: leaderboard?.period ?? 'weekly',
            subject: leaderboard?.subject ?? selectedSubjectId,
            metric: leaderboard?.metric ?? 'score',
            limit: leaderboard?.limit?.toString() ?? '',
            order: leaderboard?.order?.toString() ?? '',
            isVisible: leaderboard?.isVisible ?? true
          };
        }
        case 'exams': {
          const exam = item as CatalogExam | undefined;
          return {
            mediumId: exam?.mediumId ?? selectedMediumId,
            code: exam?.code ?? '',
            name: exam?.name ?? '',
            title: exam?.title ?? '',
            description: exam?.description ?? '',
            order: exam?.order?.toString() ?? '',
            isVisible: exam?.isVisible ?? true
          };
        }
        default:
          return {};
      }
    },
    [selectedMediumId, selectedBoardId, selectedCourseId, selectedSubjectId, selectedChapterId]
  );

  const getFormFields = useCallback(
    (tab: AdminTab): FormFieldConfig[] => {
      switch (tab) {
        case 'mediums':
          return [
            { id: 'name', label: 'Name', type: 'text', required: true },
            { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Short summary of the medium' },
            { id: 'code', label: 'Code', type: 'text', placeholder: 'Internal code (e.g. EN)' },
            { id: 'locale', label: 'Locale', type: 'text', placeholder: 'Optional locale (e.g. en-IN)' },
            { id: 'order', label: 'Display Order', type: 'number', helperText: 'Lower numbers appear first.' },
            { id: 'isVisible', label: 'Visible to users', type: 'checkbox' }
          ];
        case 'boards':
          return [
            {
              id: 'mediumId',
              label: 'Medium',
              type: 'select',
              required: true,
              options: mediums.map((medium) => ({ value: medium.id, label: medium.name }))
            },
            { id: 'name', label: 'Name', type: 'text', required: true },
            { id: 'description', label: 'Description', type: 'textarea' },
            { id: 'region', label: 'Region', type: 'text', placeholder: 'Region or country' },
            { id: 'code', label: 'Code', type: 'text', placeholder: 'Internal board code' },
            { id: 'order', label: 'Display Order', type: 'number' },
            { id: 'isVisible', label: 'Visible to users', type: 'checkbox' }
          ];
        case 'courses':
            return [
              {
                id: 'mediumId',
                label: 'Medium',
                type: 'select',
                options: mediums.map((medium) => ({ value: medium.id, label: medium.name }))
              },
              {
                id: 'boardId',
                label: 'Board (optional)',
                type: 'select',
                options: [{ value: '', label: '— No Board —' }, ...boards.map((board) => ({ value: board.id, label: board.name }))]
              },
              {
                id: 'examId',
                label: 'Exam (optional)',
                type: 'select',
                options: [{ value: '', label: '— No Exam —' }, ...examOptions.map((exam) => ({ value: exam.id, label: exam.name }))]
              },
              { id: 'name', label: 'Name', type: 'text', required: true },
              { id: 'description', label: 'Description', type: 'textarea' },
              { id: 'slug', label: 'Slug', type: 'slug' },
              { id: 'level', label: 'Level', type: 'levelSelect' },
              { id: 'thumbnail', label: 'Thumbnail', type: 'thumbnailSelect' },
              { id: 'order', label: 'Display Order', type: 'number' },
              { id: 'isVisible', label: 'Visible to users', type: 'checkbox' }
            ];
        case 'subjects':
           return [
             { id: 'name', label: 'Subject', type: 'subjectName', required: true },
             { id: 'description', label: 'Description', type: 'textarea' },
             { id: 'emoji', label: 'Icon Emoji', type: 'emoji' },
             { id: 'color', label: 'Brand Color', type: 'color' },
             { id: 'course', label: 'Course', type: 'course' },
             {
               id: 'examId',
               label: 'Exam (optional)',
               type: 'select',
               options: [{ value: '', label: '— No Exam —' }, ...examOptions.map((exam) => ({ value: exam.id, label: exam.name }))]
             },
             { id: 'order', label: 'Display Order', type: 'number' },
             { id: 'isVisible', label: 'Visible to users', type: 'checkbox' }
           ];
        case 'chapters':
          return [
            {
              id: 'subjectId',
              label: 'Subject',
              type: 'select',
              required: true,
              options: subjects.map((subject) => ({ value: subject.id, label: subject.name }))
            },
            { id: 'name', label: 'Name', type: 'text', required: true },
            { id: 'description', label: 'Description', type: 'textarea' },
            { id: 'chapterNumber', label: 'Chapter Number', type: 'number', helperText: 'Used for ordering within the subject.' },
            { id: 'durationMinutes', label: 'Recommended Duration (minutes)', type: 'number' },
            { id: 'prerequisites', label: 'Prerequisites', type: 'text', placeholder: 'Comma separated chapter IDs' },
            { id: 'order', label: 'Display Order', type: 'number' },
            { id: 'isVisible', label: 'Visible to users', type: 'checkbox' }
          ];
        case 'quizSets':
          return [
            {
              id: 'chapterId',
              label: 'Chapter',
              type: 'select',
              required: true,
              options: chapters.map((chapter) => ({ value: chapter.id, label: chapter.name }))
            },
            { id: 'name', label: 'Name', type: 'text', required: true },
            { id: 'description', label: 'Description', type: 'textarea' },
            {
              id: 'difficulty',
              label: 'Difficulty',
              type: 'select',
              options: [
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' }
              ]
            },
            { id: 'totalQuestions', label: 'Number of Questions', type: 'number' },
            { id: 'durationMinutes', label: 'Time Limit (minutes)', type: 'number' },
            { id: 'tags', label: 'Tags', type: 'text', placeholder: 'Comma separated topics' },
            { id: 'autoRunEnabled', label: 'Enable Auto Run preview', type: 'checkbox' },
            { id: 'autoRunReadAnswer', label: 'Read correct answer aloud', type: 'checkbox' },
            { id: 'autoRunReadExplanation', label: 'Read explanation aloud', type: 'checkbox' },
            { id: 'autoRunDelaySeconds', label: 'Delay between steps (seconds)', type: 'number', helperText: 'Pause before moving to next question.' },
            { id: 'autoRunVoice', label: 'Narration voice', type: 'text', placeholder: 'default' },
            { id: 'autoRunSubscriberOnly', label: 'Subscribers only', type: 'checkbox' },
            { id: 'order', label: 'Display Order', type: 'number' },
            { id: 'isVisible', label: 'Visible to users', type: 'checkbox' }
          ];
        case 'screens':
           return [
             { id: 'name', label: 'Screen Name', type: 'text', required: true },
             { id: 'path', label: 'Route Path', type: 'text', required: true, placeholder: '/admin' },
             { id: 'description', label: 'Description', type: 'textarea' },
             { id: 'category', label: 'Category', type: 'text', placeholder: 'Navigation, Feature Flag, etc.' },
             { id: 'roles', label: 'Allowed Roles', type: 'text', placeholder: 'Comma separated roles (admin, tutor, ...)' },
             { id: 'order', label: 'Display Order', type: 'number' },
             { id: 'isVisible', label: 'Visible to users', type: 'checkbox' },
             // Design fields
             {
               id: 'designTheme',
               label: 'Theme',
               type: 'select',
               options: [{ value: 'default', label: 'Default' }]
             },
             {
               id: 'designGradient',
               label: 'Background Gradient',
               type: 'select',
               options: [
                 { value: '', label: 'None' },
                 { value: 'blueGlass', label: 'Blue Glass' },
                 { value: 'sunset', label: 'Sunset' }
               ]
             },
             {
               id: 'designBgImage',
               label: 'Background Image',
               type: 'select',
               options: [{ value: '', label: 'None' }] // Will be populated with uploaded images
             },
             {
               id: 'designBgMode',
               label: 'Background Mode',
               type: 'select',
               options: [
                 { value: 'cover', label: 'Cover' },
                 { value: 'contain', label: 'Contain' }
               ]
             },
             {
               id: 'designBgBlend',
               label: 'Background Blend',
               type: 'select',
               options: [
                 { value: 'normal', label: 'Normal' },
                 { value: 'overlay', label: 'Overlay' },
                 { value: 'multiply', label: 'Multiply' },
                 { value: 'screen', label: 'Screen' }
               ]
             },
             { id: 'designOverlay', label: 'Overlay Color', type: 'text', placeholder: 'rgba(255,255,255,.55)' },
             {
               id: 'designCardVariant',
               label: 'Card Variant',
               type: 'select',
               options: [
                 { value: 'elevated', label: 'Elevated' },
                 { value: 'flat', label: 'Flat' }
               ]
             },
             { id: 'designContainerMaxWidth', label: 'Container Max Width', type: 'number', placeholder: '1100' },
             { id: 'designContainerPadding', label: 'Container Padding', type: 'number', placeholder: '24' },
             { id: 'designContainerGap', label: 'Container Gap', type: 'number', placeholder: '24' }
           ];
        case 'leaderboards':
          return [
            { id: 'title', label: 'Title', type: 'text', required: true },
            { id: 'description', label: 'Description', type: 'textarea' },
            {
              id: 'period',
              label: 'Time Period',
              type: 'select',
              options: [
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'all-time', label: 'All Time' }
              ]
            },
            {
              id: 'subject',
              label: 'Subject (optional)',
              type: 'select',
              options: [{ value: '', label: 'All Subjects' }, ...subjects.map((subject) => ({ value: subject.id, label: subject.name }))]
            },
            {
              id: 'metric',
              label: 'Metric',
              type: 'select',
              options: [
                { value: 'score', label: 'Score' },
                { value: 'streak', label: 'Streak' },
                { value: 'accuracy', label: 'Accuracy' },
                { value: 'time', label: 'Fastest Time' }
              ]
            },
            { id: 'limit', label: 'Maximum Entries', type: 'number', helperText: 'Defaults to 10 if left blank.' },
            { id: 'cardKind', label: 'Card Layout', type: 'select', options: [
              { value: 'grid', label: 'Grid' },
              { value: 'bar', label: 'Bar' }
            ] },
            { id: 'cardSize', label: 'Card Size', type: 'select', options: [] }, // Dynamic based on cardKind
            { id: 'order', label: 'Display Order', type: 'number' },
            { id: 'isVisible', label: 'Visible to users', type: 'checkbox' }
          ];
        case 'exams':
          return [
            {
              id: 'mediumId',
              label: 'Medium',
              type: 'select',
              required: true,
              options: mediums.map((medium) => ({ value: medium.id, label: medium.name }))
            },
            { id: 'code', label: 'Code', type: 'text', required: true, placeholder: 'e.g., JEE, NEET' },
            { id: 'name', label: 'Name', type: 'text', required: true },
            { id: 'title', label: 'Title', type: 'text', placeholder: 'Optional display title' },
            { id: 'description', label: 'Description', type: 'textarea' },
            { id: 'order', label: 'Display Order', type: 'number', helperText: 'Lower numbers appear first.' },
            { id: 'isVisible', label: 'Visible to users', type: 'checkbox' }
          ];
        default:
          return [];
      }
    },
    [mediums, boards, courses, subjects, chapters]
  );

  const openCreateModal = (tab: AdminTab) => {
    setModalState({ tab, mode: 'create' });
    const defaultValues = getDefaultFormValues(tab);
    if (tab === 'subjects') {
      // Prefill with current subject filters for create mode
      defaultValues.examId = normalizeExam(subjectFilters.examId);
      // courseId will be set in buildPayload from context
    }
    setFormState(defaultValues);
    setFormError(null);
  };

  const openEditModal = (tab: AdminTab, item: CatalogEntity) => {
    setModalState({ tab, mode: 'edit', item });
    setFormState(getDefaultFormValues(tab, item));
    setFormError(null);
  };

  const closeModal = () => {
    setModalState(null);
    setFormState({});
    setFormError(null);
  };

  const handleFormChange = (fieldId: string, value: any) => {
    setFormState((prev) => ({ ...prev, [fieldId]: value }));
  };

  const parseNumberField = (value: unknown): number | undefined => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  };

  const buildPayload = (tab: AdminTab, values: Record<string, any>) => {
    const base: Record<string, any> = {
      isVisible: values.isVisible !== undefined ? values.isVisible : true,
      order: parseNumberField(values.order) ?? DEFAULT_ORDER
    };

    const trimmed = (input: unknown) => (typeof input === 'string' ? input.trim() : input);

    switch (tab) {
      case 'mediums':
        return {
          ...base,
          name: trimmed(values.name) ?? '',
          description: trimmed(values.description) || undefined,
          code: trimmed(values.code) || undefined,
          locale: trimmed(values.locale) || undefined
        };
      case 'boards':
        return {
          ...base,
          name: trimmed(values.name) ?? '',
          description: trimmed(values.description) || undefined,
          region: trimmed(values.region) || undefined,
          code: trimmed(values.code) || undefined,
          mediumId: values.mediumId || undefined
        };
      case 'courses': {
          const doc: any = {
            ...base,
            name: trimmed(values.name) ?? '',
            description: trimmed(values.description) || null,
            slug: trimmed(values.slug) || null,
            level: trimmed(values.level) || null,
            thumbnail: trimmed(values.thumbnail) || null,
            mediumId: values.mediumId || null
          };
          if (values.boardId) doc.boardId = values.boardId;
          if (values.examId) doc.examId = values.examId;
          return stripUndefined(doc);
        }
      case 'subjects':
        const examId = values.examId || null;
        const examName = examId ? examOptions.find(e => e.id === examId)?.name || null : null;
        const rawName = values.name;
        const name = typeof rawName === 'string' ? rawName.trim() : '';
        const emoji = values.emoji as EmojiOpt | null;
        const color = values.color as { id: string; hex: string } | null;
        const course = values.course as { id: string; name: string } | null;
        // Get boardId and examId from the selected course for denormalization
        const selectedCourse = course?.id ? courseLookup.get(course.id) : null;
        const courseBoardId = selectedCourse?.boardId || null;
        const courseExamId = (selectedCourse as any)?.examId || null;

        return {
          ...base,
          name,
          nameLc: name.toLowerCase(),
          slug: slugify(name),
          medium: subjectFilters.medium,
          board: courseBoardId, // Denormalized from course
          courseId: course?.id || null,
          courseName: course?.name || null,
          emoji: emoji?.char || null,
          emojiId: emoji?.id || null,
          emojiName: emoji?.name || null,
          brandColorId: color?.id || null,
          brandColorHex: color?.hex || null,
          cardKind: values.cardKind || 'grid',
          cardSize: values.cardSize || 'large',
          examId: courseExamId, // Denormalized from course
          examName: courseExamId ? examOptions.find(e => e.id === courseExamId)?.name || null : null
        };
      case 'chapters': {
        // Get boardId and examId from the selected subject for denormalization
        const selectedSubject = values.subjectId ? subjectLookup.get(values.subjectId) : null;
        const subjectBoardId = (selectedSubject as any)?.boardId || null;
        const subjectExamId = (selectedSubject as any)?.examId || null;

        return {
          ...base,
          name: trimmed(values.name) ?? '',
          description: trimmed(values.description) || undefined,
          subjectId: values.subjectId,
          boardId: subjectBoardId, // Denormalized from subject
          examId: subjectExamId, // Denormalized from subject
          chapterNumber: parseNumberField(values.chapterNumber) ?? undefined,
          durationMinutes: parseNumberField(values.durationMinutes) ?? undefined,
          prerequisites: parseCommaSeparated(values.prerequisites)
        };
      }
      case 'quizSets': {
        // Get boardId and examId from the selected chapter for denormalization
        const selectedChapter = values.chapterId ? chapterLookup.get(values.chapterId) : null;
        const chapterBoardId = (selectedChapter as any)?.boardId || null;
        const chapterExamId = (selectedChapter as any)?.examId || null;

        return {
          ...base,
          name: trimmed(values.name) ?? '',
          description: trimmed(values.description) || undefined,
          chapterId: values.chapterId,
          boardId: chapterBoardId, // Denormalized from chapter
          examId: chapterExamId, // Denormalized from chapter
          difficulty: values.difficulty ?? 'medium',
          totalQuestions: parseNumberField(values.totalQuestions) ?? undefined,
          durationMinutes: parseNumberField(values.durationMinutes) ?? undefined,
          tags: parseCommaSeparated(values.tags),
          autoRunConfig: {
            enabled: Boolean(values.autoRunEnabled),
            readCorrectAnswer: Boolean(values.autoRunReadAnswer),
            readExplanation: Boolean(values.autoRunReadExplanation),
            delaySeconds: parseNumberField(values.autoRunDelaySeconds) ?? 5,
            voice: trimmed(values.autoRunVoice) || 'default',
            subscriberOnly: Boolean(values.autoRunSubscriberOnly)
          }
        };
      }
      case 'screens':
         const style: ScreenStyle = {
           theme: values.designTheme || 'default',
           gradient: values.designGradient || null,
           bgImage: values.designBgImage || null,
           bgMode: values.designBgMode || 'cover',
           bgBlend: values.designBgBlend || 'normal',
           overlay: typeof values.designOverlay === 'string' && values.designOverlay.trim() ? values.designOverlay.trim() : null,
           cardVariant: values.designCardVariant || 'elevated',
           container: {
             maxWidth: parseNumberField(values.designContainerMaxWidth) ?? 1100,
             padding: parseNumberField(values.designContainerPadding) ?? 24,
             gap: parseNumberField(values.designContainerGap) ?? 24
           }
         };
         return {
           ...base,
           name: trimmed(values.name) ?? '',
           path: trimmed(values.path) ?? '',
           description: trimmed(values.description) || undefined,
           category: trimmed(values.category) || undefined,
           roles: parseCommaSeparated(values.roles),
           style
         };
      case 'leaderboards':
        return {
          ...base,
          title: trimmed(values.title) ?? '',
          description: trimmed(values.description) || undefined,
          period: values.period ?? 'weekly',
          subject: values.subject || undefined,
          metric: values.metric ?? 'score',
          limit: parseNumberField(values.limit) ?? undefined
        };
      case 'exams':
        const code = trimmed(values.code);
        return {
          ...base,
          mediumId: values.mediumId || undefined,
          code: typeof code === 'string' ? code.toUpperCase() : '',
          name: trimmed(values.name) ?? '',
          title: trimmed(values.title) || undefined,
          description: trimmed(values.description) || undefined
        };
      default:
        return base;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!modalState) {
      return;
    }

    const { tab, mode, item } = modalState;

    if (!prerequisitesMet(tab)) {
      setFormError({
        title: 'Prerequisites not met',
        message: PREREQUISITE_MESSAGES[tab] ?? 'Prerequisites not satisfied.',
      });
      return;
    }

    const payload = buildPayload(tab, formState) as any;

    // Client-side validation
    if (tab === 'courses') {
      const errs = validateCourse({
        name: payload.name,
        slug: payload.slug,
        mediumId: payload.mediumId,
        boardId: payload.boardId,
        examId: payload.examId
      });
      if (errs.length) {
        setFormError({
          title: 'Validation error',
          message: errs.join(' '),
        });
        setIsSubmitting(false);
        return;
      }
    } else {
      if ('name' in payload && !payload.name && tab !== 'screens') {
        setFormError({
          title: 'Validation error',
          message: 'Name is required.',
        });
        return;
      }
      if (tab === 'screens' && !payload.path) {
        setFormError({
          title: 'Validation error',
          message: 'Route path is required.',
        });
        return;
      }
    }

    // Additional validation for courses
    if (tab === 'courses') {
      if (!payload.mediumId) {
        setFormError({
          title: 'Validation error',
          message: 'Medium is required.',
        });
        return;
      }
      if (!payload.boardId && !payload.examId) {
        setFormError({
          title: 'Validation error',
          message: 'Select either a Board or an Exam.',
        });
        return;
      }
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const collectionName = COLLECTION_MAP[tab];
      const userId = getCurrentUserId();

      if (mode === 'create') {
        await AdminCatalogService.createItem(collectionName, payload, userId);
      } else if (item) {
        await AdminCatalogService.updateItem(collectionName, (item as { id: string }).id, payload, userId);
      }

      closeModal();
    } catch (error) {
      console.error('Failed to save item', error);
      setFormError(explainFirebaseError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleVisibility = async (tab: AdminTab, item: CatalogEntity) => {
    const id = (item as { id: string }).id;
    setBusyState({ id, action: 'toggle' });
    try {
      const collectionName = COLLECTION_MAP[tab];
      await AdminCatalogService.toggleVisibility(collectionName, id, !(item as { isVisible?: boolean }).isVisible);
    } catch (error) {
      console.error('Failed to toggle visibility', error);
    } finally {
      setBusyState(null);
    }
  };

  const handleDuplicate = async (tab: AdminTab, item: CatalogEntity) => {
    const id = (item as { id: string }).id;
    setBusyState({ id, action: 'duplicate' });
    try {
      const collectionName = COLLECTION_MAP[tab];
      await AdminCatalogService.duplicateItem(collectionName, item, getCurrentUserId());
    } catch (error) {
      console.error('Failed to duplicate item', error);
    } finally {
      setBusyState(null);
    }
  };

  const handleDelete = async (tab: AdminTab, item: CatalogEntity) => {
    const id = (item as { id: string }).id;
    if (!window.confirm(`Delete this ${TAB_LABELS[tab].singular}? This action cannot be undone.`)) {
      return;
    }
    setBusyState({ id, action: 'delete' });
    try {
      const collectionName = COLLECTION_MAP[tab];
      await AdminCatalogService.deleteItem(collectionName, id);
    } catch (error) {
      console.error('Failed to delete item', error);
    } finally {
      setBusyState(null);
    }
  };

  const handleSyncBoards = async () => {
    setBusyState({ id: 'boards', action: 'sync' });
    try {
      await syncBoardsToFirestore(getCurrentUserId());
      // Real-time listeners will automatically update the UI
    } catch (error) {
      console.error('Failed to sync boards', error);
      alert('Failed to sync boards. Please try again.');
    } finally {
      setBusyState(null);
    }
  };

  const handleSyncScreens = async () => {
    setBusyState({ id: 'screens', action: 'sync' });
    try {
      await syncScreensToFirestore(getCurrentUserId());
      // Real-time listeners will automatically update the UI
    } catch (error) {
      console.error('Failed to sync screens', error);
      alert('Failed to sync screens. Please try again.');
    } finally {
      setBusyState(null);
    }
  };

  const handleSyncMediums = async () => {
    setBusyState({ id: 'mediums', action: 'sync' });
    try {
      await syncMediumsToFirestore(getCurrentUserId());
      // Real-time listeners will automatically update the UI
    } catch (error) {
      console.error('Failed to sync mediums', error);
      alert('Failed to sync mediums. Please try again.');
    } finally {
      setBusyState(null);
    }
  };

  const handleSyncCourses = async () => {
    setBusyState({ id: 'courses', action: 'sync' });
    try {
      await syncCoursesToFirestore(getCurrentUserId());
      // Real-time listeners will automatically update the UI
    } catch (error) {
      console.error('Failed to sync courses', error);
      alert('Failed to sync courses. Please try again.');
    } finally {
      setBusyState(null);
    }
  };

  const handleSyncSubjects = async () => {
    setBusyState({ id: 'subjects', action: 'sync' });
    try {
      await syncSubjectsToFirestore(getCurrentUserId());
      // Real-time listeners will automatically update the UI
    } catch (error) {
      console.error('Failed to sync subjects', error);
      alert('Failed to sync subjects. Please try again.');
    } finally {
      setBusyState(null);
    }
  };

  const handleSyncChapters = async () => {
    setBusyState({ id: 'chapters', action: 'sync' });
    try {
      await syncChaptersToFirestore(getCurrentUserId());
      // Real-time listeners will automatically update the UI
    } catch (error) {
      console.error('Failed to sync chapters', error);
      alert('Failed to sync chapters. Please try again.');
    } finally {
      setBusyState(null);
    }
  };

  const handleSyncQuizSets = async () => {
    setBusyState({ id: 'quizSets', action: 'sync' });
    try {
      await syncQuizSetsToFirestore(getCurrentUserId());
      // Real-time listeners will automatically update the UI
    } catch (error) {
      console.error('Failed to sync quiz sets', error);
      alert('Failed to sync quiz sets. Please try again.');
    } finally {
      setBusyState(null);
    }
  };

  const handleSyncExams = async () => {
    setBusyState({ id: 'exams', action: 'sync' });
    try {
      await syncExamsToFirestore(getCurrentUserId());
      // Real-time listeners will automatically update the UI
    } catch (error) {
      console.error('Failed to sync exams', error);
      alert('Failed to sync exams. Please try again.');
    } finally {
      setBusyState(null);
    }
  };

  const handleSyncLeaderboards = async () => {
    setBusyState({ id: 'leaderboards', action: 'sync' });
    try {
      await syncLeaderboardsToFirestore(getCurrentUserId());
      // Real-time listeners will automatically update the UI
    } catch (error) {
      console.error('Failed to sync leaderboards', error);
      alert('Failed to sync leaderboards. Please try again.');
    } finally {
      setBusyState(null);
    }
  };

  // Subject modal handlers
  const handleSubjectAdd = async (data: SubjectInput) => {
    try {
      await createSubject(data);
      setSubjectModalOpen(false);
    } catch (error) {
      console.error('Failed to create subject', error);
      alert('Failed to create subject. Please try again.');
    }
  };

  const handleSubjectEdit = async (data: SubjectInput) => {
    if (!editingSubjectId) return;
    try {
      await updateSubject(editingSubjectId, {
        name: data.name,
        order: data.order,
        enabled: data.enabled
      });
      setEditingSubjectId(null);
    } catch (error) {
      console.error('Failed to update subject', error);
      alert('Failed to update subject. Please try again.');
    }
  };

  const handleSubjectDelete = async (id: string) => {
    if (!confirm("Delete this subject? This cannot be undone.")) return;
    try {
      await deleteSubject(id);
    } catch (error) {
      console.error('Failed to delete subject', error);
      alert('Failed to delete subject. Please try again.');
    }
  };

  const handleSubjectDuplicate = async (id: string) => {
    try {
      await duplicateSubject(id);
    } catch (error) {
      console.error('Failed to duplicate subject', error);
      alert('Failed to duplicate subject. Please try again.');
    }
  };

  const handleSubjectToggle = async (id: string, enabled: boolean) => {
    try {
      await toggleSubjectEnabled(id, enabled);
    } catch (error) {
      console.error('Failed to toggle subject visibility', error);
      alert('Failed to toggle subject visibility. Please try again.');
    }
  };

  const renderFilterBar = () => {
    const shouldShowMedium = ['boards', 'courses', 'subjects', 'chapters', 'quizSets', 'leaderboards', 'exams'].includes(activeTab);
    const shouldShowBoard = ['courses', 'subjects', 'chapters', 'quizSets', 'leaderboards'].includes(activeTab);
    const shouldShowCourse = ['subjects', 'chapters', 'quizSets', 'leaderboards'].includes(activeTab);
    const shouldShowSubject = ['chapters', 'quizSets', 'leaderboards'].includes(activeTab);
    const shouldShowChapter = ['quizSets'].includes(activeTab);
    const shouldShowExam = ['courses', 'subjects', 'chapters', 'quizSets', 'leaderboards'].includes(activeTab);

    if (!shouldShowMedium && !shouldShowBoard && !shouldShowCourse && !shouldShowSubject && !shouldShowChapter && !shouldShowExam) {
      return null;
    }

    if (activeTab === 'subjects') {
      // Special handling for subjects with required filters
      const filters: Filters = {
        mediumId: subjectFilters.medium,
        boardId: subjectFilters.board || null,
        examId: subjectFilters.examId || null,
        courseId: subjectFilters.courseId || null,
      };
      const { ready, message } = gate('subjects', filters);

      // For enabling course dropdown, we need medium + (board OR exam)
      const readyForCourse = !!subjectFilters.medium && (!!subjectFilters.board || !!subjectFilters.examId);

      return (
        <div className="space-y-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Medium <span className="text-red-600">*</span>
              </label>
              <select
                value={subjectFilters.medium}
                onChange={(event) => {
                  handleMediumFilterChange(event.target.value);
                  setSubjectFilters(f => ({
                    medium: event.target.value,
                    board: "",
                    examId: "",
                    courseId: ""
                  }));
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Select Medium —</option>
                {mediums.map((medium) => (
                  <option key={medium.id} value={medium.id}>
                    {medium.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Board</label>
              <select
                value={subjectFilters.board}
                disabled={!subjectFilters.medium}
                onChange={(event) => {
                  handleBoardFilterChange(event.target.value);
                  setSubjectFilters(f => ({
                    ...f,
                    board: event.target.value,
                    courseId: ""
                  }));
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">— Select Board —</option>
                {filteredBoards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Exam</label>
              <select
                value={subjectFilters.examId}
                disabled={!subjectFilters.medium}
                onChange={(event) => {
                  handleExamFilterChange(event.target.value);
                  setSubjectFilters(f => ({
                    ...f,
                    examId: event.target.value,
                    courseId: ""
                  }));
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">— Select Exam —</option>
                {examOptions.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Course</label>
              <select
                value={subjectFilters.courseId}
                disabled={!readyForCourse}
                onChange={(event) => {
                  handleCourseFilterChange(event.target.value);
                  setSubjectFilters(f => ({ ...f, courseId: event.target.value }));
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">— Select Course —</option>
                {filteredCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="self-end">
              <Button variant="ghost" onClick={() => {
                clearFilters();
                setSubjectFilters({ medium: '', board: '', courseId: '', examId: '' });
              }}>
                Clear Filters
              </Button>
            </div>
          </div>

          {!ready && (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              {message}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'courses') {
      // Special handling for courses with required filters
      const filters: Filters = {
        mediumId: selectedMediumId,
        boardId: selectedBoardId || null,
        examId: selectedExamId || null,
      };
      const { ready, message } = gate('courses', filters);

      return (
        <div className="space-y-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Medium <span className="text-red-600">*</span>
              </label>
              <select
                value={selectedMediumId}
                onChange={(event) => handleMediumFilterChange(event.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Select Medium —</option>
                {mediums.map((medium) => (
                  <option key={medium.id} value={medium.id}>
                    {medium.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Board</label>
              <select
                value={selectedBoardId}
                disabled={!selectedMediumId}
                onChange={(event) => handleBoardFilterChange(event.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">— Select Board —</option>
                {filteredBoards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Exam</label>
              <select
                value={selectedExamId}
                disabled={!selectedMediumId}
                onChange={(event) => handleExamFilterChange(event.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">— Select Exam —</option>
                {filteredExams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="self-end">
              <Button variant="ghost" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>

          {!ready && (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              {message}
            </div>
          )}
        </div>
      );
    }

    // Default filter bar for other tabs
    const filters: Filters = {
      mediumId: selectedMediumId,
      boardId: selectedBoardId || null,
      examId: selectedExamId || null,
      courseId: selectedCourseId || null,
      subjectId: selectedSubjectId || null,
      chapterId: selectedChapterId || null,
    };
    const pageMap: Record<string, Page> = {
      boards: 'boards',
      exams: 'exams',
      chapters: 'chapters',
      quizSets: 'sets',
    };
    const page = pageMap[activeTab] || 'boards';
    const { ready, message } = gate(page, filters);

    return (
      <div className="space-y-4 mb-6">
        <div className="flex flex-wrap gap-3">
          {shouldShowMedium && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Medium</label>
              <select
                value={selectedMediumId}
                onChange={(event) => handleMediumFilterChange(event.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Select Medium —</option>
                {mediums.map((medium) => (
                  <option key={medium.id} value={medium.id}>
                    {medium.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {shouldShowBoard && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Board</label>
              <select
                value={selectedBoardId}
                disabled={!selectedMediumId}
                onChange={(event) => handleBoardFilterChange(event.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">— Select Board —</option>
                {filteredBoards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {shouldShowExam && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Exam</label>
              <select
                value={selectedExamId}
                disabled={!selectedMediumId}
                onChange={(event) => handleExamFilterChange(event.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">— Select Exam —</option>
                {filteredExams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {shouldShowCourse && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Course</label>
              <select
                value={selectedCourseId}
                disabled={!selectedMediumId || (!selectedBoardId && !selectedExamId)}
                onChange={(event) => handleCourseFilterChange(event.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">— Select Course —</option>
                {filteredCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {shouldShowSubject && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Subject</label>
              <select
                value={selectedSubjectId}
                disabled={!selectedCourseId}
                onChange={(event) => handleSubjectFilterChange(event.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">— Select Subject —</option>
                {filteredSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {shouldShowChapter && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Chapter</label>
              <select
                value={selectedChapterId}
                disabled={!selectedSubjectId}
                onChange={(event) => handleChapterFilterChange(event.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">— Select Chapter —</option>
                {filteredChapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="self-end">
            <Button variant="ghost" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>

        {!ready && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            {message}
          </div>
        )}
      </div>
    );
  };

  const renderMetaLine = (label: string, value: string | undefined) => (
    <div className="text-sm text-gray-500">
      <span className="font-medium text-gray-600 mr-1">{label}:</span>
      <span>{value || '—'}</span>
    </div>
  );

  const renderItemMeta = (tab: AdminTab, item: CatalogEntity) => {
    switch (tab) {
      case 'boards': {
        const board = item as CatalogBoard;
        return (
          <div className="mt-3 space-y-1">
            {renderMetaLine('Medium', mediumLookup.get(board.mediumId || '')?.name)}
            {renderMetaLine('Region', board.region)}
            {renderMetaLine('Code', board.code)}
          </div>
        );
      }
      case 'courses': {
        const course = item as CatalogCourse;
        const boardName = course.boardId ? boardLookup.get(course.boardId)?.name : '';
        const examName = (course as any).examId ? examOptions.find(e => e.id === (course as any).examId)?.name : '';
        return (
          <div className="mt-3 space-y-1">
            {renderMetaLine('Board', boardName)}
            {renderMetaLine('Exam', examName)}
            {renderMetaLine('Medium', mediumLookup.get(course.mediumId || '')?.name)}
            {renderMetaLine('Level', course.level)}
          </div>
        );
      }
      case 'subjects': {
        const subject = item as CatalogSubject;
        const examId = (subject as any).examId;
        const examName = (subject as any).examName;
        const emoji = (subject as any).emoji;
        const brandColorHex = (subject as any).brandColorHex;
        const course = courseLookup.get(subject.courseId);
        const boardName = course?.boardId ? boardLookup.get(course.boardId)?.name : '';
        return (
          <div className="mt-3 space-y-1">
            {renderMetaLine('Board', boardName)}
            {renderMetaLine('Exam', examName)}
            {renderMetaLine('Course', course?.name)}
            {emoji && renderMetaLine('Icon', emoji)}
            {brandColorHex && renderMetaLine('Color', brandColorHex)}
          </div>
        );
      }
      case 'chapters': {
        const chapter = item as CatalogChapter;
        const subject = subjectLookup.get(chapter.subjectId);
        const course = subject ? courseLookup.get(subject.courseId) : undefined;
        const boardName = course?.boardId ? boardLookup.get(course.boardId)?.name : '';
        const examName = (chapter as any).examId ? examOptions.find(e => e.id === (chapter as any).examId)?.name : '';
        return (
          <div className="mt-3 space-y-1">
            {renderMetaLine('Board', boardName)}
            {renderMetaLine('Exam', examName)}
            {renderMetaLine('Subject', subject?.name)}
            {renderMetaLine('Chapter No.', chapter.chapterNumber?.toString())}
            {renderMetaLine('Duration', chapter.durationMinutes ? `${chapter.durationMinutes} min` : undefined)}
          </div>
        );
      }
      case 'quizSets': {
        const quizSet = item as CatalogQuizSet;
        const autoRun = quizSet.autoRunConfig;
        const chapter = chapterLookup.get(quizSet.chapterId);
        const subject = chapter ? subjectLookup.get(chapter.subjectId) : undefined;
        const course = subject ? courseLookup.get(subject.courseId) : undefined;
        const boardName = course?.boardId ? boardLookup.get(course.boardId)?.name : '';
        const examName = (quizSet as any).examId ? examOptions.find(e => e.id === (quizSet as any).examId)?.name : '';
        return (
          <div className="mt-3 space-y-1">
            {renderMetaLine('Board', boardName)}
            {renderMetaLine('Exam', examName)}
            {renderMetaLine('Chapter', chapter?.name)}
            {renderMetaLine('Difficulty', quizSet.difficulty)}
            {renderMetaLine('Questions', quizSet.totalQuestions?.toString())}
            {autoRun?.enabled
              ? renderMetaLine('Auto Run', `${autoRun.subscriberOnly ? 'Subscribers only' : 'Enabled'} · Delay ${(autoRun.delaySeconds ?? 5).toString()}s`)
              : renderMetaLine('Auto Run', 'Disabled')}
          </div>
        );
      }
      case 'screens': {
        const screen = item as AppScreen;
        return (
          <div className="mt-3 space-y-1">
            {renderMetaLine('Path', screen.path)}
            {renderMetaLine('Category', screen.category)}
            {renderMetaLine('Roles', screen.roles?.join(', '))}
          </div>
        );
      }
      case 'leaderboards': {
        const leaderboard = item as LeaderboardConfig;
        return (
          <div className="mt-3 space-y-1">
            {renderMetaLine('Period', leaderboard.period)}
            {renderMetaLine('Metric', leaderboard.metric)}
            {renderMetaLine('Limit', leaderboard.limit?.toString())}
          </div>
        );
      }
      case 'exams': {
        const exam = item as CatalogExam;
        return (
          <div className="mt-3 space-y-1">
            {renderMetaLine('Code', exam.code)}
            {renderMetaLine('Title', exam.title)}
          </div>
        );
      }
      default:
        return null;
    }
  };

  const items = getItemsForTab(activeTab);
  const tabDefinition = TAB_LABELS[activeTab];

  const handleAssetUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const path = `assets/backgrounds/${file.name}`;
      const url = await uploadAsset(file, path);
      // Update theme images
      if (currentTheme) {
        const logicalName = file.name.split('.')[0];
        const updatedTheme = {
          ...currentTheme,
          images: { ...currentTheme.images, [logicalName]: path }
        };
        // Save to Firestore
        const db = getFirestore(app);
        await updateDoc(doc(db, 'themes', 'default'), updatedTheme);
        setCurrentTheme(updatedTheme);
      }
      alert('Asset uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const scanAssets = async () => {
    try {
      const count = await indexAssets();
      alert(`Indexed ${count} assets!`);
    } catch (error) {
      console.error('Failed to scan assets:', error);
      alert('Failed to scan assets.');
    }
  };

  const bootstrapComponents = async () => {
    alert('Bootstrap components from server scripts only. Run: npm run seed:firestore');
  };

  const applyDefaults = async () => {
    alert('Apply defaults from server scripts only. Run: npm run seed:firestore');
  };

  const setGlobalThemeHandler = async (themeId: string) => {
    alert('Global theme setting not implemented in UI yet.');
  };

  const openThemeEditor = () => {
    if (currentTheme) {
      setThemeJson(JSON.stringify(currentTheme, null, 2));
      setThemeModalOpen(true);
    }
  };

  const saveTheme = async () => {
    try {
      const parsed = JSON.parse(themeJson);
      const db = getFirestore(app);
      await updateDoc(doc(db, 'themes', 'default'), parsed);
      setCurrentTheme(parsed);
      setThemeModalOpen(false);
      alert('Theme updated successfully!');
    } catch (error) {
      console.error('Failed to save theme:', error);
      alert('Invalid JSON or save failed.');
    }
  };

  const renderDesignPanel = () => {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">🎨 Design System</h3>
          <p className="text-gray-600">Live-editable themes, backgrounds, and visual styles</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card variant="elevated" className="p-6">
            <h4 className="text-lg font-semibold mb-4">Theme Management</h4>
            <p className="text-gray-600 mb-4">
              {themeCount} themes available. Current: {currentTheme?.name || 'Loading...'}
            </p>
            <div className="space-y-2">
              <Button variant="primary" onClick={openThemeEditor}>
                Edit Current Theme
              </Button>
              <select
                onChange={(e) => setGlobalThemeHandler(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Set Global Theme</option>
                {themes.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          <Card variant="elevated" className="p-6">
            <h4 className="text-lg font-semibold mb-4">Asset Library</h4>
            <p className="text-gray-600 mb-4">
              {assetCount} assets indexed. Upload new images to Firebase Storage.
            </p>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleAssetUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <Button variant="outline" onClick={scanAssets}>
                Scan Storage → Update Library
              </Button>
            </div>
          </Card>

          <Card variant="elevated" className="p-6">
            <h4 className="text-lg font-semibold mb-4">Screen Components</h4>
            <p className="text-gray-600 mb-4">
              Bootstrap editable components and apply visual defaults to all screens.
            </p>
            <div className="space-y-2">
              <Button variant="secondary" onClick={bootstrapComponents}>
                Bootstrap Components
              </Button>
              <Button variant="secondary" onClick={applyDefaults}>
                Apply Nice Defaults
              </Button>
            </div>
          </Card>

          <Card variant="elevated" className="p-6">
            <h4 className="text-lg font-semibold mb-4">Screen Styles</h4>
            <p className="text-gray-600 mb-4">
              Configure backgrounds, gradients, and layouts for each screen.
            </p>
            <Button variant="primary" onClick={() => setTab(navigate, 'screens')}>
              Edit Screen Styles
            </Button>
          </Card>
        </div>

        <Card variant="elevated" className="p-6">
          <h4 className="text-lg font-semibold mb-4">Live Preview</h4>
          <p className="text-gray-600 mb-4">
            See your design changes applied in real-time.
          </p>
          <Button variant="outline" onClick={() => window.open('/', '_blank')}>
            Preview App
          </Button>
        </Card>

        <SyncCenterCard />

        <Card variant="elevated" className="p-6">
          <h4 className="text-lg font-semibold mb-4">Design System Features</h4>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3">
              <span className="text-green-500">✅</span>
              <span>Cascading theme system</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-500">✅</span>
              <span>Live-editable backgrounds</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-500">✅</span>
              <span>Gradient & blend modes</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-500">✅</span>
              <span>Card variant system</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-500">✅</span>
              <span>Firebase Storage assets</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-500">✅</span>
              <span>Admin-only security</span>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderPanelContent = () => {
    switch (activeTab) {
      case 'mediums':
        return renderItemsList();
      case 'boards':
        return renderItemsList();
      case 'courses':
        return renderItemsList();
      case 'subjects':
        return renderItemsList();
      case 'chapters':
        return renderItemsList();
      case 'quizSets':
        return renderItemsList();
      case 'screens':
        return renderItemsList();
      case 'leaderboards':
        return renderItemsList();
      case 'exams':
        return renderItemsList();
      case 'design':
        return renderDesignPanel();
      case 'seo':
        return <SeoCard />;
      case 'sync':
        return (
          <div className="space-y-6">
            <SyncCenterCard />
          </div>
        );
      default:
        return renderItemsList();
    }
  };

  const renderItemsList = () => {
    if (!prerequisitesMet(activeTab)) {
      return (
        <Card variant="outlined" className="text-center py-12">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Prerequisites Required</h3>
          <p className="text-gray-500">{PREREQUISITE_MESSAGES[activeTab]}</p>
          <div className="mt-6 flex justify-center">
            <Button variant="primary" onClick={() => setTab(navigate, 'mediums')}>
              Go to Mediums
            </Button>
          </div>
        </Card>
      );
    }

    // Check gate for all tabs that have filters
    const filters: Filters = {
      mediumId: selectedMediumId,
      boardId: selectedBoardId || null,
      examId: selectedExamId || null,
      courseId: selectedCourseId || null,
      subjectId: selectedSubjectId || null,
      chapterId: selectedChapterId || null,
    };

    const pageMap: Record<string, Page> = {
      boards: 'boards',
      exams: 'exams',
      courses: 'courses',
      subjects: 'subjects',
      chapters: 'chapters',
      quizSets: 'sets',
    };

    const page = pageMap[activeTab];
    if (page) {
      const { ready } = gate(page, filters);
      if (!ready) {
        return null; // Hide content, message shown in filter bar
      }
    }

    if (items.length === 0) {
      return (
        <Card variant="outlined" className="text-center py-12">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No {tabDefinition.plural} yet</h3>
          <p className="text-gray-500 mb-6">Start by creating your first {tabDefinition.singular.toLowerCase()}.</p>
          <div className="flex justify-center">
            {activeTab === 'subjects' ? (
              <Button
                variant="primary"
                onClick={() => setSubjectModalOpen(true)}
                disabled={!subjectFilters.courseId}
              >
                Add {tabDefinition.singular}
              </Button>
            ) : (
              <Button variant="primary" onClick={() => openCreateModal(activeTab)}>
                Add {tabDefinition.singular}
              </Button>
            )}
          </div>
        </Card>
      );
    }

    if (activeTab === 'subjects') {
      const boardNameMap = Object.fromEntries(Array.from(boardLookup.entries()).map(([id, board]) => [id, board.name]));
      const examNameMap = examOptions.reduce((acc, exam) => ({ ...acc, [exam.id]: exam.name }), {});

      return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const subject = item as any;
            return (
              <SubjectCard
                key={subject.id}
                row={subject}
                boardName={boardNameMap}
                examName={examNameMap}
                onToggleVisible={handleSubjectToggle}
                onEdit={(id) => {
                  setEditingSubjectId(id);
                  setSubjectModalOpen(true);
                }}
                onDuplicate={handleSubjectDuplicate}
                onDelete={handleSubjectDelete}
              />
            );
          })}
        </div>
      );
    }

    return (
      <ResponsiveGrid cols={{ default: 1, md: 2, xl: 3 }} gap={5}>
        {items.map((item) => {
          const visibility = (item as { isVisible?: boolean }).isVisible !== false;
          const isToggleBusy = busyState?.id === (item as { id: string }).id && busyState.action === 'toggle';
          const isDeleteBusy = busyState?.id === (item as { id: string }).id && busyState.action === 'delete';
          const isDuplicateBusy = busyState?.id === (item as { id: string }).id && busyState.action === 'duplicate';

          return (
            <Card key={(item as { id: string }).id} variant="elevated" className="relative overflow-hidden" hover={false}>
              <div className="absolute top-4 right-4 flex gap-2 z-20">
                <Button
                  variant={visibility ? 'secondary' : 'outline'}
                  size="small"
                  onClick={() => handleToggleVisibility(activeTab, item)}
                  loading={isToggleBusy}
                >
                  {visibility ? 'Visible' : 'Hidden'}
                </Button>
                <Button variant="ghost" size="small" onClick={() => openEditModal(activeTab, item)}>
                  Edit
                </Button>
              </div>

              <div className="pr-28">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {tabDefinition.icon} {getItemDisplayName(activeTab, item)}
                </h3>
                {'description' in item && item.description && (
                  <p className="text-gray-600 mb-3">{(item as { description?: string }).description}</p>
                )}

                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                    Order: {(item as { order?: number }).order ?? DEFAULT_ORDER}
                  </span>
                  <span className="bg-gray-50 px-2 py-1 rounded-full">
                    Created: {formatTimestamp((item as { createdAt?: Timestamp | string }).createdAt)}
                  </span>
                  <span className="bg-gray-50 px-2 py-1 rounded-full">
                    Updated: {formatTimestamp((item as { updatedAt?: Timestamp | string }).updatedAt)}
                  </span>
                </div>

                {renderItemMeta(activeTab, item)}
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => handleDuplicate(activeTab, item)}
                  loading={isDuplicateBusy}
                >
                  Duplicate
                </Button>
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => handleDelete(activeTab, item)}
                  loading={isDeleteBusy}
                >
                  Delete
                </Button>
              </div>
            </Card>
          );
        })}
      </ResponsiveGrid>
    );
  };

  const renderField = (field: FormFieldConfig) => {
    const value = formState[field.id];
    const commonProps = {
      id: field.id,
      name: field.id,
      value: value ?? '',
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        handleFormChange(field.id, event.target.value),
      required: field.required,
      placeholder: field.placeholder,
      disabled: field.disabled
    };

    switch (field.type) {
      case 'text':
        return <Input {...commonProps} />;
      case 'number':
        return <Input type="number" {...commonProps} />;
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        );
      case 'checkbox':
        return (
          <div className="flex items-center gap-3">
            <input
              id={field.id}
              name={field.id}
              type="checkbox"
              checked={Boolean(value ?? true)}
              onChange={(event) => handleFormChange(field.id, event.target.checked)}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">{field.label}</span>
          </div>
        );
      case 'select':
        let options = field.options || [];
        if (field.id === 'cardSize') {
          const cardKind = formState.cardKind || 'grid';
          options = cardKind === 'grid'
            ? [
                { value: 'small', label: 'Small' },
                { value: 'large', label: 'Large' },
                { value: 'extra-large', label: 'Extra Large' }
              ]
            : [
                { value: 'thin', label: 'Thin' },
                { value: 'wide', label: 'Wide' }
              ];
        }
        return (
          <select
            id={field.id}
            name={field.id}
            value={value ?? ''}
            required={field.required}
            onChange={(event) => handleFormChange(field.id, event.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
       case 'subjectName':
         return <SubjectNameSelect value={value ?? ''} onChange={(v) => handleFormChange(field.id, v)} />;
       case 'emoji':
         return <EmojiSelect value={value as EmojiOpt | null} onChange={(v) => handleFormChange(field.id, v)} />;
       case 'color':
         const colorValue = value as { id: string; hex: string } | null;
         return <ColorSelect id={colorValue?.id || null} onChange={(id, hex) => handleFormChange(field.id, { id, hex })} />;
       case 'course':
         return <CoursePicker
           ctx={{
             medium: subjectFilters.medium,
             board: subjectFilters.board,
             examId: subjectFilters.examId
           }}
           onAttached={(instanceId) => handleFormChange(field.id, { id: instanceId, name: 'Loading...' })}
           allowExamSelection={true}
         />;
       case 'slug':
         return <SlugSelect
           name={formState.name || ''}
           ctx={{
             medium: formState.mediumId ? mediumLookup.get(formState.mediumId)?.name : undefined,
             board: formState.boardId ? boardLookup.get(formState.boardId)?.name : undefined,
             examName: formState.examId ? examOptions.find(e => e.id === formState.examId)?.name : undefined
           }}
           value={value}
           onChange={(v) => handleFormChange(field.id, v)}
           collectionToCheck="courses"
         />;
       case 'levelSelect':
         return <LevelSelect value={value} onChange={(v) => handleFormChange(field.id, v)} />;
       case 'thumbnailSelect':
         return <ThumbnailSelect value={value} onChange={(v) => handleFormChange(field.id, v)} storagePath="design-assets/thumbnails" />;
       default:
         return null;
    }
  };

  const formFields = modalState ? getFormFields(modalState.tab) : [];

  return (
    <Layout showHeader={false} showFooter={false}>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Control Center</h1>
                <p className="text-gray-500 mt-1 max-w-2xl">
                  Manage mediums, boards, courses, subjects, chapters, quiz sets, application screens, and leaderboards in one place.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate('/admin')}>Exit Admin</Button>
                <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
                {activeTab === 'subjects' ? (
                  <Button
                    variant="primary"
                    onClick={() => setSubjectModalOpen(true)}
                    disabled={!subjectFilters.courseId}
                  >
                    Add {tabDefinition.singular}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => openCreateModal(activeTab)}
                  >
                    Add {tabDefinition.singular}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          <div role="tablist" aria-label="Admin sections" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <AdminTile
              tab="mediums"
              activeTab={activeTab}
              title="Mediums"
              subtitle="Languages and education mediums for course catalogs"
              count={counts.mediums}
              icon={<span className="text-3xl">🗣️</span>}
            />
            <AdminTile
              tab="boards"
              activeTab={activeTab}
              title="Boards"
              subtitle="Education boards associated with each medium"
              count={counts.boards}
              icon={<span className="text-3xl">🏫</span>}
            />
            <AdminTile
              tab="courses"
              activeTab={activeTab}
              title="Courses"
              subtitle="Course tracks and preparation programs"
              count={counts.courses}
              icon={<span className="text-3xl">📚</span>}
            />
            <AdminTile
              tab="subjects"
              activeTab={activeTab}
              title="Subjects"
              subtitle="Subject catalog under each course"
              count={counts.subjects}
              icon={<span className="text-3xl">📘</span>}
            />
            <AdminTile
              tab="chapters"
              activeTab={activeTab}
              title="Chapters"
              subtitle="Chapter progression for the selected subject"
              count={counts.chapters}
              icon={<span className="text-3xl">🧩</span>}
            />
            <AdminTile
              tab="quizSets"
              activeTab={activeTab}
              title="Quiz Sets"
              subtitle="Assessments mapped to each chapter"
              count={counts.quizSets}
              icon={<span className="text-3xl">❓</span>}
            />
            <AdminTile
              tab="screens"
              activeTab={activeTab}
              title="App Screens"
              subtitle="Front-end screens and feature toggles"
              count={counts.screens}
              icon={<span className="text-3xl">🗂️</span>}
            />
            <AdminTile
              tab="leaderboards"
              activeTab={activeTab}
              title="Leaderboards"
              subtitle="Leaderboard definitions and scoring rules"
              count={counts.leaderboards}
              icon={<span className="text-3xl">🏆</span>}
            />
            <AdminTile
              tab="exams"
              activeTab={activeTab}
              title="Exams"
              subtitle="Competitive/entrance exams and certifications"
              count={counts.exams}
              icon={<span className="text-3xl">📝</span>}
            />
            <AdminTile
              tab="design"
              activeTab={activeTab}
              title="Design System"
              subtitle="Live-editable themes, backgrounds, and visual styles"
              count={counts.design}
              icon={<span className="text-3xl">🎨</span>}
            />
            {isAdmin && (
              <>
                <AdminTile
                  tab="seo"
                  activeTab={activeTab}
                  title="SEO & Discovery"
                  subtitle="Manage meta titles, descriptions, and search engine settings"
                  count={counts.seo}
                  icon={<span className="text-3xl">🔍</span>}
                />
                <AdminTile
                  tab="sync"
                  activeTab={activeTab}
                  title="Sync Center"
                  subtitle="Run seeding/backfills and scan assets"
                  count={counts.sync}
                  icon={<span className="text-3xl">🔄</span>}
                />
              </>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{tabDefinition.plural}</h2>
                <p className="text-gray-500">{tabDefinition.description}</p>
              </div>
              <div className="flex gap-3">
                {activeTab === 'boards' && (
                  <Button
                    variant="outline"
                    onClick={handleSyncBoards}
                    loading={busyState?.action === 'sync'}
                  >
                    Sync from Registry
                  </Button>
                )}
                {activeTab === 'mediums' && (
                  <Button
                    variant="outline"
                    onClick={handleSyncMediums}
                    loading={busyState?.action === 'sync'}
                  >
                    Sync from Registry
                  </Button>
                )}
                {activeTab === 'courses' && (
                  <Button
                    variant="outline"
                    onClick={handleSyncCourses}
                    loading={busyState?.action === 'sync'}
                  >
                    Sync from Registry
                  </Button>
                )}
                {activeTab === 'subjects' && (
                  <Button
                    variant="outline"
                    onClick={handleSyncSubjects}
                    loading={busyState?.action === 'sync'}
                  >
                    Sync from Registry
                  </Button>
                )}
                {activeTab === 'chapters' && (
                  <Button
                    variant="outline"
                    onClick={handleSyncChapters}
                    loading={busyState?.action === 'sync'}
                  >
                    Sync from Registry
                  </Button>
                )}
                {activeTab === 'quizSets' && (
                  <Button
                    variant="outline"
                    onClick={handleSyncQuizSets}
                    loading={busyState?.action === 'sync'}
                  >
                    Sync from Registry
                  </Button>
                )}
                {activeTab === 'screens' && (
                  <Button
                    variant="outline"
                    onClick={handleSyncScreens}
                    loading={busyState?.action === 'sync'}
                  >
                    Sync from Registry
                  </Button>
                )}
                {activeTab === 'exams' && (
                  <Button
                    variant="outline"
                    onClick={handleSyncExams}
                    loading={busyState?.action === 'sync'}
                  >
                    Sync from Registry
                  </Button>
                )}
                {activeTab === 'leaderboards' && (
                  <Button
                    variant="outline"
                    onClick={handleSyncLeaderboards}
                    loading={busyState?.action === 'sync'}
                  >
                    Sync from Registry
                  </Button>
                )}
                <Button variant="primary" onClick={() => openCreateModal(activeTab)}>
                  Add {tabDefinition.singular}
                </Button>
              </div>
            </div>

            {renderFilterBar()}
            {renderPanelContent()}
          </div>
        </div>
      </div>

      <Modal
        isOpen={Boolean(modalState)}
        onClose={closeModal}
        title={`${modalState?.mode === 'edit' ? 'Edit' : 'Add'} ${modalState ? TAB_LABELS[modalState.tab].singular : ''}`}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {formFields.map((field) => (
            <div key={field.id}>
              {field.type !== 'checkbox' && (
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              )}
              {renderField(field)}
              {field.helperText && <p className="text-xs text-gray-500 mt-2">{field.helperText}</p>}
            </div>
          ))}

          {formError && (
            <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm">
              <div className="font-semibold text-red-700">{formError.title}</div>
              <div className="mt-1 text-red-700">{formError.message}</div>
              {formError.actionHref && (
                <div className="mt-2">
                  <a className="inline-flex items-center rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                     href={formError.actionHref} target="_blank" rel="noreferrer">
                    {formError.actionLabel || "Open Console"}
                  </a>
                </div>
              )}
              {formError.raw && (
                <details className="mt-2 text-red-700/80">
                  <summary>Technical details</summary>
                  <pre className="whitespace-pre-wrap break-all">{formError.raw}</pre>
                </details>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
              {modalState?.mode === 'edit' ? 'Update' : 'Create'} {modalState ? TAB_LABELS[modalState.tab].singular : ''}
            </Button>
            <Button type="button" variant="outline" fullWidth onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        title="Edit Theme"
        size="large"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Edit the theme JSON directly. Changes will be saved to Firestore and applied live.
          </p>
          <textarea
            value={themeJson}
            onChange={(e) => setThemeJson(e.target.value)}
            className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm"
            placeholder="Theme JSON..."
          />
          <div className="flex gap-4">
            <Button variant="primary" onClick={saveTheme}>
              Save Theme
            </Button>
            <Button variant="outline" onClick={() => setThemeModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <SubjectFormModal
        open={subjectModalOpen}
        initial={editingSubjectId ? (() => {
          const subject = subjects.find(s => s.id === editingSubjectId);
          return subject ? {
            name: subject.name,
            order: subject.order ?? 1,
            enabled: subject.enabled ?? true,
            mediumId: subject.mediumId || '',
            courseId: subject.courseId,
            boardId: subject.boardId || null,
            examId: subject.examId || null
          } : undefined;
        })() : undefined}
        onClose={() => {
          setSubjectModalOpen(false);
          setEditingSubjectId(null);
        }}
        onSubmit={editingSubjectId ? handleSubjectEdit : handleSubjectAdd}
      />
    </Layout>
  );
};

export default AdminDashboard;
