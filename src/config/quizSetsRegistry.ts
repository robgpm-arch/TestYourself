export interface QuizSetData {
  id: string;
  name: string;
  description: string;
  chapterId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  totalQuestions?: number;
  durationMinutes?: number;
  tags?: string[];
  active: boolean;
  order: number;
}

export const QUIZ_SETS_REGISTRY: QuizSetData[] = [
  // Algebra - Linear Equations quiz sets
  {
    id: "linear-equations-set-1",
    name: "Linear Equations - Basic Concepts",
    description: "Practice basic linear equation solving techniques",
    chapterId: "linear-equations",
    difficulty: "easy",
    totalQuestions: 10,
    durationMinutes: 15,
    tags: ["algebra", "equations", "basic"],
    active: true,
    order: 1
  },
  {
    id: "linear-equations-set-2",
    name: "Linear Equations - Word Problems",
    description: "Apply linear equations to real-world scenarios",
    chapterId: "linear-equations",
    difficulty: "medium",
    totalQuestions: 8,
    durationMinutes: 20,
    tags: ["algebra", "word-problems", "applications"],
    active: true,
    order: 2
  },
  {
    id: "linear-equations-set-3",
    name: "Linear Equations - Advanced",
    description: "Complex linear equation systems and inequalities",
    chapterId: "linear-equations",
    difficulty: "hard",
    totalQuestions: 12,
    durationMinutes: 25,
    tags: ["algebra", "systems", "inequalities"],
    active: true,
    order: 3
  },
  // Physics - Kinematics quiz sets
  {
    id: "kinematics-set-1",
    name: "Kinematics - Basic Motion",
    description: "Fundamental concepts of motion and displacement",
    chapterId: "kinematics",
    difficulty: "easy",
    totalQuestions: 10,
    durationMinutes: 15,
    tags: ["physics", "motion", "kinematics"],
    active: true,
    order: 1
  },
  {
    id: "kinematics-set-2",
    name: "Kinematics - Velocity & Acceleration",
    description: "Understanding speed, velocity, and acceleration",
    chapterId: "kinematics",
    difficulty: "medium",
    totalQuestions: 12,
    durationMinutes: 20,
    tags: ["physics", "velocity", "acceleration"],
    active: true,
    order: 2
  },
  {
    id: "kinematics-set-3",
    name: "Kinematics - Projectile Motion",
    description: "Two-dimensional motion and projectile trajectories",
    chapterId: "kinematics",
    difficulty: "hard",
    totalQuestions: 15,
    durationMinutes: 30,
    tags: ["physics", "projectile", "2d-motion"],
    active: true,
    order: 3
  }
];