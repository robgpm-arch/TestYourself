export default {
  // Where to look for content JSON (folders are optional—only imported if found)
  contentRoots: {
    mediums: ["content/mediums/**/*.json", "content/mediums.json"],
    boards: ["content/boards/**/*.json", "content/boards.json", "registry/boards.json"],
    courses: ["content/courses/**/*.json", "registry/courses.json"],
    subjects: ["content/courses/**/subjects/**/*.json", "registry/subjects.json"],
    chapters: "content/courses/**/subjects/**/chapters/**/*.json",
    quiz_sets: "content/courses/**/subjects/**/chapters/**/quizSets/**/*.json",
    exams: ["content/exams/**/*.json", "registry/exams.json"],
    themes: "content/themes/**/*.json"
  },

  // Where to discover screens (pick whichever exists)
  screens: {
    // Preferred: your registry (if you already maintain one)
    registryFile: "src/config/screensRegistry.ts",
    // Fallback: auto-discover react-router routes in source
    autoDiscoverGlobs: ["src/**/*.{tsx,jsx}"]
  },

  // Firestore collection names (adjust to your app)
  collections: {
    mediums: "mediums",
    boards: "boards",
    courses: "courses",
    subjects: "subjects",
    chapters: "chapters",
    quiz_sets: "quiz_sets",
    exams: "exams",
    screens: "screens",
    themes: "themes"
  },

  // Normalize booleans/ordering; synced across all entities
  defaults: {
    order: 1000,
    active: true
  },

  // Output snapshot
  outFile: ".out/project-scan.json"
};