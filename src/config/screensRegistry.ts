export type ScreenMeta = {
  id: string;          // stable key, also doc id
  route: string;
  name: string;
  title?: string;
  description?: string;
  category?: string;
  icon?: string;
  order?: number;
  active?: boolean;
  roles?: string[];
};

export const SCREENS_REGISTRY: ScreenMeta[] = [
  // Public routes
  {
    id: "home",
    route: "/",
    name: "Home",
    title: "Home",
    description: "Main landing page",
    category: "public",
    order: 1,
    active: true
  },
  {
    id: "syllabus_browser",
    route: "/syllabus",
    name: "Syllabus Browser",
    title: "Syllabus",
    description: "Browse course syllabi and subjects",
    category: "learn",
    order: 2,
    active: true
  },
  {
    id: "quiz_instructions",
    route: "/quiz-instructions",
    name: "Quiz Instructions",
    title: "Quiz Instructions",
    description: "Instructions before starting a quiz",
    category: "practice",
    order: 3,
    active: true
  },
  {
    id: "quiz_player_numerical",
    route: "/quiz-player-numerical",
    name: "Numerical Quiz Player",
    title: "Numerical Quiz",
    description: "Take numerical quizzes",
    category: "practice",
    order: 4,
    active: true
  },
  {
    id: "quiz_player_comprehension",
    route: "/quiz-player-comprehension",
    name: "Comprehension Quiz Player",
    title: "Comprehension Quiz",
    description: "Take comprehension quizzes",
    category: "practice",
    order: 5,
    active: true
  },
  {
    id: "exam_mode",
    route: "/exam-mode",
    name: "Exam Mode",
    title: "Exam Mode",
    description: "Take exams in exam mode",
    category: "practice",
    order: 6,
    active: true
  },
  {
    id: "results_celebration",
    route: "/results-celebration",
    name: "Results Celebration",
    title: "Results",
    description: "View quiz results and celebration",
    category: "practice",
    order: 7,
    active: true
  },
  {
    id: "achievement_celebration",
    route: "/achievement-celebration",
    name: "Achievement Celebration",
    title: "Achievement",
    description: "Celebrate achievements",
    category: "practice",
    order: 8,
    active: true
  },
  {
    id: "detailed_analytics",
    route: "/detailed-analytics",
    name: "Detailed Analytics",
    title: "Analytics",
    description: "View detailed performance analytics",
    category: "learn",
    order: 9,
    active: true
  },
  {
    id: "leaderboards",
    route: "/leaderboards",
    name: "Leaderboards",
    title: "Leaderboards",
    description: "View leaderboards and rankings",
    category: "social",
    order: 10,
    active: true
  },
  {
    id: "chapter_sets",
    route: "/chapter-sets",
    name: "Chapter Sets",
    title: "Chapter Sets",
    description: "Browse and select chapter quiz sets",
    category: "practice",
    order: 11,
    active: true
  },
  {
    id: "motivational_hub",
    route: "/motivational-hub",
    name: "Motivational Hub",
    title: "Motivation",
    description: "Get motivated and track progress",
    category: "learn",
    order: 12,
    active: true
  },
  {
    id: "daily_challenges",
    route: "/daily-challenges",
    name: "Daily Challenges",
    title: "Daily Challenges",
    description: "Complete daily challenges",
    category: "practice",
    order: 13,
    active: true
  },
  {
    id: "friends_social",
    route: "/friends",
    name: "Friends & Social",
    title: "Friends",
    description: "Connect with friends and compete",
    category: "social",
    order: 14,
    active: true
  },
  {
    id: "chat_messaging",
    route: "/chat",
    name: "Chat Messaging",
    title: "Chat",
    description: "Chat with friends",
    category: "social",
    order: 15,
    active: true
  },
  {
    id: "multiplayer_lobby",
    route: "/lobby",
    name: "Multiplayer Lobby",
    title: "Lobby",
    description: "Join multiplayer games",
    category: "social",
    order: 16,
    active: true
  },
  {
    id: "multiplayer_battle",
    route: "/battle",
    name: "Multiplayer Battle",
    title: "Battle",
    description: "Play multiplayer battles",
    category: "social",
    order: 17,
    active: true
  },
  {
    id: "challenge_result",
    route: "/challenge-result",
    name: "Challenge Result",
    title: "Challenge Result",
    description: "View challenge results",
    category: "social",
    order: 18,
    active: true
  },
  {
    id: "invite_friends",
    route: "/invite",
    name: "Invite Friends",
    title: "Invite",
    description: "Invite friends to join",
    category: "social",
    order: 19,
    active: true
  },
  {
    id: "theme_picker",
    route: "/theme-picker",
    name: "Theme Picker",
    title: "Theme",
    description: "Choose your app theme",
    category: "settings",
    order: 20,
    active: true
  },
  {
    id: "profile",
    route: "/profile",
    name: "Profile",
    title: "Profile",
    description: "View and edit your profile",
    category: "settings",
    order: 21,
    active: true
  },
  {
    id: "settings",
    route: "/settings",
    name: "Settings",
    title: "Settings",
    description: "App settings and preferences",
    category: "settings",
    order: 22,
    active: true
  },

  // Admin routes
  {
    id: "admin_panel",
    route: "/admin",
    name: "Admin Panel",
    title: "Admin",
    description: "Main admin dashboard",
    category: "admin",
    order: 100,
    active: true,
    roles: ["admin"]
  },
  {
    id: "admin_dashboard",
    route: "/admin/dashboard",
    name: "Admin Dashboard",
    title: "Admin Dashboard",
    description: "Manage catalogs and content",
    category: "admin",
    order: 101,
    active: true,
    roles: ["admin"]
  },
  {
    id: "admin_files",
    route: "/admin/files",
    name: "Admin File Manager",
    title: "File Manager",
    description: "Manage uploaded files",
    category: "admin",
    order: 102,
    active: true,
    roles: ["admin"]
  }
];