export interface SubjectData {
  id: string;
  name: string;
  description: string;
  courseId: string;
  icon: string;
  color: string;
  active: boolean;
  order: number;
}

export const SUBJECTS_REGISTRY: SubjectData[] = [
  // Mathematics subjects
  {
    id: 'algebra',
    name: 'Algebra',
    description: 'Study of mathematical symbols and rules',
    courseId: 'maths',
    icon: '📘',
    color: '#3b82f6',
    active: true,
    order: 1,
  },
  {
    id: 'geometry',
    name: 'Geometry',
    description: 'Study of shapes, sizes, and properties of space',
    courseId: 'maths',
    icon: '📐',
    color: '#10b981',
    active: true,
    order: 2,
  },
  {
    id: 'trigonometry',
    name: 'Trigonometry',
    description: 'Study of relationships between angles and sides of triangles',
    courseId: 'maths',
    icon: '📏',
    color: '#f59e0b',
    active: true,
    order: 3,
  },
  // Science subjects
  {
    id: 'physics',
    name: 'Physics',
    description: 'Study of matter, energy, and their interactions',
    courseId: 'science',
    icon: '⚛️',
    color: '#6366f1',
    active: true,
    order: 1,
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    description: 'Study of matter, its properties, and chemical reactions',
    courseId: 'science',
    icon: '⚗️',
    color: '#ef4444',
    active: true,
    order: 2,
  },
  {
    id: 'biology',
    name: 'Biology',
    description: 'Study of living organisms and life processes',
    courseId: 'science',
    icon: '🧬',
    color: '#22c55e',
    active: true,
    order: 3,
  },
];
