import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Modal from '../Modal';
import {
  listBoards,
  listExams,
  listExamsByMedium,
  listCourses,
  listSubjects,
  listChapters,
  listQuizSets,
  upsert,
  toggleEnabled,
  deleteCourse,
  deleteSubject,
  deleteChapter,
  deleteQuizSet,
  generateId,
} from '../../services/catalogService';
import {
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
  filtersToRouteParams,
  routeParamsToFilters,
  CatalogFilters,
} from '../../utils/adminRouting';
import CatalogFiltersComponent from './CatalogFilters';
import {
  CatalogMedium,
  CatalogBoard,
  CatalogExam,
  CatalogCourse,
  CatalogSubject,
  CatalogChapter,
  CatalogQuizSet,
} from '../../types/firebase';

// Generic card component for catalog items
interface CatalogCardProps<T> {
  item: T & { id: string };
  onEdit: (item: T & { id: string }) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  onOpen?: (id: string) => void;
  canOpen?: boolean;
  hasChildren?: boolean;
}

function CatalogCard<T extends { name: string; enabled: boolean }>({
  item,
  onEdit,
  onToggle,
  onDelete,
  onOpen,
  canOpen = false,
  hasChildren = false,
}: CatalogCardProps<T>) {
  return (
    <div className={`p-4 border rounded-lg ${item.enabled ? 'bg-white' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-sm text-gray-500">ID: {item.id}</p>
        </div>
        <div className="flex gap-2">
          {canOpen && onOpen && (
            <button
              onClick={() => onOpen(item.id)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Open
            </button>
          )}
          <button
            onClick={() => onEdit(item)}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Edit
          </button>
          <button
            onClick={() => onToggle(item.id, !item.enabled)}
            className={`px-3 py-1 text-sm rounded ${
              item.enabled
                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {item.enabled ? 'Disable' : 'Enable'}
          </button>
          <button
            onClick={() => onDelete(item.id)}
            disabled={hasChildren}
            className={`px-3 py-1 text-sm rounded ${
              hasChildren
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Main catalog manager component with Board/Exam parallel routing
export default function CatalogManager() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State
  const [filters, setFilters] = useState<CatalogFilters>(createInitialFilters);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Dropdown data
  const [mediums, setMediums] = useState<CatalogMedium[]>([]);
  const [boards, setBoards] = useState<CatalogBoard[]>([]);
  const [exams, setExams] = useState<CatalogExam[]>([]);
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [subjects, setSubjects] = useState<CatalogSubject[]>([]);

  // Sync filters with URL
  useEffect(() => {
    const params = parseAdminRoute(searchParams);
    const newFilters = routeParamsToFilters(params);
    setFilters(newFilters);
  }, [searchParams]);

  // Update URL when filters change
  useEffect(() => {
    const params = filtersToRouteParams(filters, getCurrentTab());
    const newSearchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) newSearchParams.set(key, value);
    });
    setSearchParams(newSearchParams);
  }, [filters]);

  // Load dropdown data based on filters
  useEffect(() => {
    if (filters.mediumId) {
      loadBoards();
      loadExams();
    }
  }, [filters.mediumId]);

  useEffect(() => {
    if (filters.mediumId && (filters.boardId || filters.examId)) {
      loadCourses();
    } else {
      setCourses([]);
    }
  }, [filters.mediumId, filters.boardId, filters.examId]);

  useEffect(() => {
    if (filters.courseId) {
      loadSubjects();
    } else {
      setSubjects([]);
    }
  }, [filters.courseId]);

  // Load items for current tab
  useEffect(() => {
    loadItems();
  }, [filters]);

  // Load mediums from Firestore
  useEffect(() => {
    const loadMediums = async () => {
      try {
        const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        const q = query(collection(db, 'mediums'), orderBy('order'));
        const snap = await getDocs(q);
        const loadedMediums = snap.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<CatalogMedium, 'id'>),
        }));
        console.log('[Mediums] loaded from Firestore:', loadedMediums);
        setMediums(loadedMediums);
      } catch (error) {
        console.error('[Mediums] failed to load:', error);
        // Fallback to static data if Firestore fails
        setMediums([
          { id: 'en', name: 'English', enabled: true, order: 1 },
          { id: 'hi', name: 'Hindi', enabled: true, order: 2 },
          { id: 'te', name: 'Telugu', enabled: true, order: 3 },
        ] as CatalogMedium[]);
      }
    };
    loadMediums();
  }, []);

  const loadBoards = async () => {
    if (!filters.mediumId) return;
    try {
      const docs = await listBoards(filters.mediumId);
      setBoards(docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<CatalogBoard, 'id'>) })));
    } catch (error) {
      console.error('Error loading boards:', error);
    }
  };

  const loadExams = async () => {
    if (!filters.mediumId) return;
    try {
      const docs = await listExams(filters.mediumId);
      setExams(docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<CatalogExam, 'id'>) })));
    } catch (error) {
      console.error('Error loading exams:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const docs = await listCourses(
        filters.mediumId,
        filters.boardId || undefined,
        filters.examId || undefined
      );
      setCourses(docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<CatalogCourse, 'id'>) })));
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadSubjects = async () => {
    if (!filters.courseId) return;
    try {
      const docs = await listSubjects(filters.courseId);
      setSubjects(docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<CatalogSubject, 'id'>) })));
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      let docs: any[] = [];
      const tab = getCurrentTab();

      switch (tab) {
        case 'boards':
          docs = await listBoards(filters.mediumId);
          break;
        case 'exams':
          docs = await listExams(filters.mediumId);
          break;
        case 'courses':
          docs = await listCourses(
            filters.mediumId,
            filters.boardId || undefined,
            filters.examId || undefined
          );
          break;
        case 'subjects':
          if (filters.courseId) {
            docs = await listSubjects(filters.courseId);
          }
          break;
        case 'chapters':
          if (filters.subjectId) {
            docs = await listChapters(filters.subjectId);
          }
          break;
        case 'quizsets':
          if (filters.subjectId) {
            // Quiz sets are under chapters, but we show them for subjects
            // This is simplified - you might need to load chapters first
            docs = [];
          }
          break;
      }

      setItems(docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTab = ():
    | 'mediums'
    | 'boards'
    | 'exams'
    | 'courses'
    | 'subjects'
    | 'chapters'
    | 'quizsets' => {
    if (filters.subjectId) return 'chapters';
    if (filters.courseId) return 'subjects';
    if (filters.boardId || filters.examId) return 'courses';
    if (filters.mediumId) return 'boards'; // Default to boards when medium is selected
    return 'mediums';
  };

  const handleAdd = () => {
    const tab = getCurrentTab();
    if (tab === 'chapters') {
      setShowCreateModal(true);
    } else {
      const newId = generateId(tab);
      console.log('Add new item:', tab, 'ID:', newId);
      // Open modal with empty form
    }
  };

  const handleEdit = (item: any) => {
    console.log('Edit item:', item);
    // Open modal with item data
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const tab = getCurrentTab();
      await toggleEnabled(tab, id, enabled);
      await loadItems();
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const tab = getCurrentTab();
      switch (tab) {
        case 'courses':
          await deleteCourse(id);
          break;
        case 'subjects':
          await deleteSubject(id);
          break;
        case 'chapters':
          await deleteChapter(id);
          break;
        case 'quizsets':
          await deleteQuizSet(id);
          break;
      }
      await loadItems();
    } catch (error: any) {
      alert(error.message || 'Delete failed');
    }
  };

  const handleOpen = (id: string) => {
    const tab = getCurrentTab();
    let newFilters = { ...filters };

    switch (tab) {
      case 'boards':
        newFilters = { ...filters, boardId: id, examId: null, courseId: null, subjectId: null };
        break;
      case 'exams':
        newFilters = { ...filters, examId: id, boardId: null, courseId: null, subjectId: null };
        break;
      case 'courses':
        newFilters = { ...filters, courseId: id, subjectId: null };
        break;
      case 'subjects':
        newFilters = { ...filters, subjectId: id };
        break;
    }

    setFilters(newFilters);
  };

  const canOpen = () => {
    const tab = getCurrentTab();
    return tab !== 'chapters' && tab !== 'quizsets'; // Can't open deeper than chapters
  };

  const breadcrumbs = generateBreadcrumbs(filtersToRouteParams(filters, getCurrentTab()));

  // Chapter Create Modal Component
  const ChapterCreateModal = () => {
    const [chapterData, setChapterData] = useState({
      name: '',
      description: '',
      chapterNumber: 1,
      durationMinutes: 30,
    });
    const [contextFilters, setContextFilters] = useState({
      mediumId: filters.mediumId,
      boardId: filters.boardId,
      examId: filters.examId,
      courseId: filters.courseId,
      subjectId: filters.subjectId,
    });
    const [saving, setSaving] = useState(false);

    // Load data for dropdowns
    const [boards, setBoards] = useState<CatalogBoard[]>([]);
    const [exams, setExams] = useState<CatalogExam[]>([]);
    const [courses, setCourses] = useState<CatalogCourse[]>([]);
    const [subjects, setSubjects] = useState<CatalogSubject[]>([]);

    // Debug: Log when modal opens
    console.log('[ChapterCreateModal] Opened with contextFilters:', contextFilters);
    console.log('[ChapterCreateModal] Available mediums:', mediums);

    // Load boards and exams when medium changes
    useEffect(() => {
      if (!contextFilters.mediumId) {
        setBoards([]);
        setExams([]);
        return;
      }
      console.log(
        '[ChapterCreateModal] Loading boards and exams for mediumId:',
        contextFilters.mediumId
      );
      listBoards(contextFilters.mediumId)
        .then(docs => {
          const boardsData = docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<CatalogBoard, 'id'>),
          }));
          console.log('[ChapterCreateModal] Loaded boards:', boardsData);
          setBoards(boardsData);
        })
        .catch(error => {
          console.error('[ChapterCreateModal] Error loading boards:', error);
          setBoards([]);
        });
      listExamsByMedium(contextFilters.mediumId)
        .then(docs => {
          const examsData = docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<CatalogExam, 'id'>),
          }));
          console.log('[ChapterCreateModal] Loaded exams:', examsData);
          setExams(examsData);
        })
        .catch(error => {
          console.error('[ChapterCreateModal] Error loading exams:', error);
          setExams([]);
        });
    }, [contextFilters.mediumId]);

    // Load courses when board/exam changes
    useEffect(() => {
      if (!contextFilters.mediumId || (!contextFilters.boardId && !contextFilters.examId)) {
        setCourses([]);
        return;
      }
      listCourses(
        contextFilters.mediumId,
        contextFilters.boardId || undefined,
        contextFilters.examId || undefined
      ).then(docs =>
        setCourses(docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<CatalogCourse, 'id'>) })))
      );
    }, [contextFilters.mediumId, contextFilters.boardId, contextFilters.examId]);

    // Load subjects when course changes
    useEffect(() => {
      if (!contextFilters.courseId) {
        setSubjects([]);
        return;
      }
      listSubjects(contextFilters.courseId).then(docs =>
        setSubjects(
          docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<CatalogSubject, 'id'>) }))
        )
      );
    }, [contextFilters.courseId]);

    const handleCreate = async () => {
      if (!chapterData.name.trim() || !contextFilters.subjectId) return;

      setSaving(true);
      try {
        const chapterId = generateId('chapters');
        await upsert('chapters', chapterId, {
          ...chapterData,
          subjectId: contextFilters.subjectId,
          enabled: true,
          order: 999, // Will be sorted later
        });

        setShowCreateModal(false);
        setChapterData({ name: '', description: '', chapterNumber: 1, durationMinutes: 30 });
        setContextFilters({
          mediumId: filters.mediumId,
          boardId: filters.boardId,
          examId: filters.examId,
          courseId: filters.courseId,
          subjectId: filters.subjectId,
        });
        await loadItems(); // Refresh the list
      } catch (error) {
        console.error('Error creating chapter:', error);
        alert('Failed to create chapter');
      } finally {
        setSaving(false);
      }
    };

    const pickBoard = (boardId: string | null) => {
      setContextFilters(prev => ({
        ...prev,
        boardId,
        examId: null, // Clear exam when board is selected
        courseId: null,
        subjectId: null,
      }));
    };

    const pickExam = (examId: string | null) => {
      setContextFilters(prev => ({
        ...prev,
        examId,
        boardId: null, // Clear board when exam is selected
        courseId: null,
        subjectId: null,
      }));
    };

    return (
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Chapter"
        size="large"
      >
        <div className="space-y-6">
          {/* Context Selection */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Select Context</h3>
            <div className="space-y-4">
              {/* Medium - Full Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medium</label>
                <select
                  value={contextFilters.mediumId}
                  onChange={e =>
                    setContextFilters(prev => ({
                      ...prev,
                      mediumId: e.target.value,
                      boardId: null,
                      examId: null,
                      courseId: null,
                      subjectId: null,
                    }))
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select</option>
                  {mediums.map(medium => (
                    <option key={medium.id} value={medium.id}>
                      {medium.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Board and Exam - Separate Rows for Better Visibility */}
              <div className="space-y-4">
                {/* Board - Full Width Row */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
                  <select
                    value={contextFilters.boardId || ''}
                    onChange={e => pickBoard(e.target.value || null)}
                    disabled={!contextFilters.mediumId || !!contextFilters.examId}
                    className="w-full p-2 border rounded disabled:bg-gray-100"
                  >
                    <option value="">{boards.length ? 'Select' : 'No Boards'}</option>
                    {boards.map(board => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Exam - Full Width Row */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
                  <select
                    value={contextFilters.examId || ''}
                    onChange={e => pickExam(e.target.value || null)}
                    disabled={!contextFilters.mediumId || !!contextFilters.boardId}
                    className="w-full p-2 border rounded disabled:bg-gray-100"
                  >
                    <option value="">{exams.length ? 'Select' : 'No Exams'}</option>
                    {exams.map(exam => (
                      <option key={exam.id} value={exam.id}>
                        {exam.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Course - Full Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  value={contextFilters.courseId || ''}
                  onChange={e =>
                    setContextFilters(prev => ({
                      ...prev,
                      courseId: e.target.value || null,
                      subjectId: null,
                    }))
                  }
                  disabled={
                    !contextFilters.mediumId || (!contextFilters.boardId && !contextFilters.examId)
                  }
                  className="w-full p-2 border rounded disabled:bg-gray-100"
                >
                  <option value="">{courses.length ? 'Select' : 'No Courses'}</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject - Full Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  value={contextFilters.subjectId || ''}
                  onChange={e =>
                    setContextFilters(prev => ({
                      ...prev,
                      subjectId: e.target.value || null,
                    }))
                  }
                  disabled={!contextFilters.courseId}
                  className="w-full p-2 border rounded disabled:bg-gray-100"
                >
                  <option value="">{subjects.length ? 'Select' : 'No Subjects'}</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Chapter Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Name *</label>
              <input
                type="text"
                value={chapterData.name}
                onChange={e => setChapterData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Enter chapter name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={chapterData.description}
                onChange={e => setChapterData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Enter chapter description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chapter Number
                </label>
                <input
                  type="number"
                  value={chapterData.chapterNumber}
                  onChange={e =>
                    setChapterData(prev => ({
                      ...prev,
                      chapterNumber: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-full p-2 border rounded"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={chapterData.durationMinutes}
                  onChange={e =>
                    setChapterData(prev => ({
                      ...prev,
                      durationMinutes: parseInt(e.target.value) || 30,
                    }))
                  }
                  className="w-full p-2 border rounded"
                  min="1"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!chapterData.name.trim() || !contextFilters.subjectId || saving}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Chapter'}
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* Breadcrumbs */}
      <div className="mb-4">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.path}>
            {index > 0 && ' > '}
            <a href={crumb.path} className="text-blue-500 hover:underline">
              {crumb.label}
            </a>
          </span>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <CatalogFiltersComponent
          filters={filters}
          setFilters={setFilters}
          mediums={mediums}
          boards={boards}
          courses={courses}
          subjects={subjects}
        />

        <div className="mt-2 text-sm text-gray-600">
          Pick either Board or Exam (mutually exclusive). Selections cascade and reset deeper levels
          when changed.
        </div>
      </div>

      {/* Catalog Display */}
      {(filters.mediumId ||
        filters.boardId ||
        filters.examId ||
        filters.courseId ||
        filters.subjectId) && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Catalog Overview</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Medium Display */}
            {filters.mediumId && mediums.find(m => m.id === filters.mediumId) && (
              <div className="bg-blue-50 p-3 rounded border">
                <div className="text-sm font-medium text-blue-800">Medium</div>
                <div className="text-blue-600">
                  {mediums.find(m => m.id === filters.mediumId)?.name}
                </div>
              </div>
            )}

            {/* Board Display */}
            {filters.boardId && boards.find(b => b.id === filters.boardId) && (
              <div className="bg-green-50 p-3 rounded border">
                <div className="text-sm font-medium text-green-800">Board</div>
                <div className="text-green-600">
                  {boards.find(b => b.id === filters.boardId)?.name}
                </div>
              </div>
            )}

            {/* Exam Display */}
            {filters.examId && exams.find(e => e.id === filters.examId) && (
              <div className="bg-purple-50 p-3 rounded border">
                <div className="text-sm font-medium text-purple-800">Exam</div>
                <div className="text-purple-600">
                  {exams.find(e => e.id === filters.examId)?.name}
                </div>
              </div>
            )}

            {/* Course Display */}
            {filters.courseId && courses.find(c => c.id === filters.courseId) && (
              <div className="bg-orange-50 p-3 rounded border">
                <div className="text-sm font-medium text-orange-800">Course</div>
                <div className="text-orange-600">
                  {courses.find(c => c.id === filters.courseId)?.name}
                </div>
              </div>
            )}

            {/* Subject Display */}
            {filters.subjectId && subjects.find(s => s.id === filters.subjectId) && (
              <div className="bg-red-50 p-3 rounded border">
                <div className="text-sm font-medium text-red-800">Subject</div>
                <div className="text-red-600">
                  {subjects.find(s => s.id === filters.subjectId)?.name}
                </div>
              </div>
            )}

            {/* Current Level Display */}
            <div className="bg-gray-50 p-3 rounded border">
              <div className="text-sm font-medium text-gray-800">Current Level</div>
              <div className="text-gray-600 capitalize">
                {filters.subjectId
                  ? 'Chapters & Quiz Sets'
                  : filters.courseId
                    ? 'Subjects'
                    : filters.boardId || filters.examId
                      ? 'Courses'
                      : filters.mediumId
                        ? 'Boards/Exams'
                        : 'Mediums'}
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{mediums.length}</div>
                <div className="text-sm text-gray-600">Mediums</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{boards.length}</div>
                <div className="text-sm text-gray-600">Boards</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{exams.length}</div>
                <div className="text-sm text-gray-600">Exams</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{courses.length}</div>
                <div className="text-sm text-gray-600">Courses</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold capitalize">{getCurrentTab()}</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add {getCurrentTab().slice(0, -1)}
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <CatalogCard
            key={item.id}
            item={item}
            onEdit={handleEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onOpen={canOpen() ? handleOpen : undefined}
            canOpen={canOpen()}
            hasChildren={false}
          />
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No {getCurrentTab()} found. Select filters above and click "Add" to create your first one.
        </div>
      )}

      {/* Chapter Create Modal */}
      <ChapterCreateModal />
    </div>
  );
}
