export interface ChapterData {
  id: string;
  name: string;
  description: string;
  subjectId: string;
  chapterNumber?: number;
  durationMinutes?: number;
  prerequisites?: string[];
  active: boolean;
  order: number;
}

export const CHAPTERS_REGISTRY: ChapterData[] = [
  // Algebra chapters
  {
    id: "linear-equations",
    name: "Linear Equations",
    description: "Solving linear equations and inequalities",
    subjectId: "algebra",
    chapterNumber: 1,
    durationMinutes: 45,
    prerequisites: [],
    active: true,
    order: 1
  },
  // Physics chapters
  {
    id: "kinematics",
    name: "Kinematics",
    description: "Study of motion without considering forces",
    subjectId: "physics",
    chapterNumber: 1,
    durationMinutes: 60,
    prerequisites: [],
    active: true,
    order: 1
  },
  // Geometry chapters
  {
    id: "basic-geometry",
    name: "Basic Geometry",
    description: "Fundamental concepts of points, lines, and shapes",
    subjectId: "geometry",
    chapterNumber: 1,
    durationMinutes: 40,
    prerequisites: [],
    active: true,
    order: 1
  },
  {
    id: "triangles",
    name: "Triangles",
    description: "Properties and theorems related to triangles",
    subjectId: "geometry",
    chapterNumber: 2,
    durationMinutes: 50,
    prerequisites: ["basic-geometry"],
    active: true,
    order: 2
  },
  // Trigonometry chapters
  {
    id: "trigonometric-ratios",
    name: "Trigonometric Ratios",
    description: "Sine, cosine, tangent and their applications",
    subjectId: "trigonometry",
    chapterNumber: 1,
    durationMinutes: 55,
    prerequisites: [],
    active: true,
    order: 1
  },
  // Chemistry chapters
  {
    id: "basic-chemistry",
    name: "Basic Chemistry",
    description: "Introduction to atoms, molecules, and chemical reactions",
    subjectId: "chemistry",
    chapterNumber: 1,
    durationMinutes: 45,
    prerequisites: [],
    active: true,
    order: 1
  },
  // Biology chapters
  {
    id: "cell-biology",
    name: "Cell Biology",
    description: "Structure and function of cells",
    subjectId: "biology",
    chapterNumber: 1,
    durationMinutes: 50,
    prerequisites: [],
    active: true,
    order: 1
  }
];