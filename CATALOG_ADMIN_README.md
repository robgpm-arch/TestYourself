# Admin Catalog Management System

Complete implementation for hierarchical catalog management in TestYourself quiz app.

## Overview

This system provides end-to-end admin functionality for managing the educational content catalog with the hierarchy:

```
Medium → (Board | Exam) → Course → Subject → Chapter → Quiz Set
```

**Key Feature: Board/Exam Parallel Routing**
- Both Board and Exam paths are supported throughout the entire hierarchy
- Mutually exclusive selection: Pick either Board OR Exam (not both)
- Cascading filters: Selections automatically reset deeper levels when changed
- URL persistence: Filter state is maintained in query parameters

## Architecture

### Data Model

All collections use flat structure with parent references:

- **mediums**: Base level (English, Hindi, etc.)
- **boards**: Belong to mediums (CBSE, ICSE, etc.)
- **exams**: Belong to mediums (JEE, NEET, etc.)
- **courses**: Belong to medium + (board OR exam)
- **subjects**: Belong to courses
- **chapters**: Belong to subjects
- **quiz_sets**: Belong to chapters

### Routing Contract

```
/admin/dashboard?tab=<level>&<parent_param>=<parent_id>
```

Examples:
- `/admin/dashboard?tab=boards&medium=en`
- `/admin/dashboard?tab=courses&medium=en&board=cbse`
- `/admin/dashboard?tab=courses&medium=en&exam=jee`
- `/admin/dashboard?tab=subjects&course=maths`

## Board/Exam Parallel Routing System

### Filter State Management
```typescript
interface CatalogFilters {
  mediumId: string;
  boardId?: string | null;   // exactly one of boardId/examId set
  examId?: string | null;
  courseId?: string | null;
  subjectId?: string | null;
}
```

### Mutually Exclusive Selection
- **Board OR Exam**: Only one can be selected at a time
- **Cascading Reset**: Changing Board/Exam clears deeper selections
- **URL Persistence**: Filter state maintained in query parameters

### UI Components
- **Dual Dropdowns**: Both Board and Exam dropdowns visible
- **Mutual Disabling**: Selecting one disables the other
- **Cascading Filters**: Each selection filters the next level
- **Context Awareness**: Dropdowns only show relevant options

### Query Behavior
- **Courses**: Filtered by `mediumId + (boardId OR examId)`
- **All Levels**: Respect the Board|Exam selection throughout hierarchy
- **Database Indexes**: Composite indexes created for efficient queries

## Files Created

### 1. Types (`src/types/firebase.ts`)
- `CatalogMedium`, `CatalogBoard`, `CatalogExam`
- `CatalogCourse`, `CatalogSubject`, `CatalogChapter`, `CatalogQuizSet`
- All extend `AdminAuditMetadata` and `VisibilityConfig`

### 2. Catalog Service (`src/services/catalogService.ts`)
- Query functions: `listBoards()`, `listExams()`, `listCourses()`, etc.
- CRUD helpers: `upsert()`, `toggleEnabled()`, `deleteCourse()`, etc.
- Safe deletes with child checks
- Cascade delete option
- Admin token refresh utilities

### 3. Admin Routing (`src/utils/adminRouting.ts`)
- Route building and parsing utilities
- Navigation helpers for "Open" actions
- Breadcrumb generation
- Validation helpers

### 4. Catalog Manager Component (`src/components/admin/CatalogManager.tsx`)
- Complete React component with routing integration
- Generic card component for all catalog levels
- Add/Edit/Toggle/Delete operations
- Breadcrumb navigation

### 5. Debug Utilities (`src/utils/debug.ts`)
- Browser console debugging tools
- Admin permission testing
- Direct delete testing functions

## Usage Guide

### Basic Setup

1. **Import the catalog service:**
```typescript
import {
  listBoards,
  upsert,
  toggleEnabled,
  deleteCourse
} from '../../services/catalogService';
```

2. **Use routing utilities:**
```typescript
import {
  buildAdminRoute,
  navigateToBoards
} from '../../utils/adminRouting';

// Navigate to boards for a medium
const path = navigateToBoards(mediumId);
navigate(path);
```

3. **Implement CRUD operations:**
```typescript
// Add new item
const newId = generateId('courses');
await upsert('courses', newId, {
  name: 'Mathematics',
  mediumId: 'en',
  boardId: 'cbse',
  enabled: true,
  order: 1
});

// Toggle visibility
await toggleEnabled('courses', courseId, false);

// Safe delete with child checks
try {
  await deleteCourse(courseId);
} catch (error) {
  alert(error.message); // "Cannot delete: subjects exist under this course"
}
```

### Component Integration

```typescript
import CatalogManager from '../../components/admin/CatalogManager';

// In your admin dashboard route
function AdminDashboard() {
  return <CatalogManager />;
}
```

### Course Dropdown Filtering

When adding subjects, filter courses by current context:

```typescript
import { listCatalogCoursesForContext } from '../../services/catalogService';

const [courses, setCourses] = useState([]);

useEffect(() => {
  if (mediumId) {
    listCatalogCoursesForContext(mediumId, boardId, examId)
      .then(setCourses);
  }
}, [mediumId, boardId, examId]);

// In your form
<select>
  {courses.map(course => (
    <option key={course.id} value={course.id}>
      {course.name}
    </option>
  ))}
</select>
```

## Security Rules

The Firestore rules have been updated to include:

- **Superuser admin rule** at the top for full admin access
- **Hierarchical visibility** checks for catalog items
- **User data protection** for personal content
- **Subscription gating** for premium materials

## Database Indexes Required

Firestore will prompt you to create these indexes:

```
boards: mediumId, order
exams: mediumId, order
courses: mediumId + boardId, order
courses: mediumId + examId, order
subjects: courseId, order
chapters: subjectId, order
quiz_sets: chapterId, order
```

## UX Patterns

### Card Actions
- **Open**: Navigate to child level (Boards → Courses → Subjects → Chapters → Quiz Sets)
- **Edit**: Open modal with current values
- **Toggle**: Enable/disable visibility
- **Delete**: Safe delete with child checks

### Navigation Flow
1. Start at Mediums level
2. Click "Open" on a Medium → see Boards/Exams
3. Click "Open" on a Board → see Courses for that Board
4. Click "Open" on a Course → see Subjects
5. Continue down the hierarchy

### Safety Features
- **Child checks**: Cannot delete items with children
- **Cascade option**: Optional force delete with children
- **Token refresh**: Automatic admin token refresh
- **Error handling**: Graceful fallbacks for permission errors

## Testing

### Browser Console Testing

```javascript
// Test admin permissions
__testAdminPermissions()

// Test direct delete
__tryDelete('courses', 'your-course-id')
```

### Manual Testing Steps

1. Create a Medium
2. Add Boards/Exams under it
3. Create Courses linked to Boards/Exams
4. Add Subjects to Courses
5. Try deleting items with/without children
6. Test enable/disable toggles
7. Verify navigation breadcrumbs work

## Troubleshooting

### Permission Denied Errors
- Check admin token: `__testAdminPermissions()`
- Verify rules deployed: Check Firebase console
- Test direct operations: Use `__tryDelete()`

### Navigation Issues
- Check route parameters are correct
- Verify parent-child relationships exist
- Use breadcrumbs to debug navigation path

### Delete Blocked
- Check if item has children using collectionGroup queries
- Use cascade delete for force removal
- Verify admin permissions

## Performance Notes

- **Queries optimized** with proper where/orderBy clauses
- **Indexes required** for compound queries
- **Batch operations** for cascade deletes
- **Limit(1)** for existence checks to minimize reads

## Future Enhancements

- **Bulk operations** for multiple items
- **Import/export** functionality
- **Search and filtering** within levels
- **Audit logging** for all changes
- **Validation rules** for data integrity
- **Preview mode** for content visibility

This system provides a complete, production-ready admin interface for managing your educational content catalog with proper security, safety checks, and user experience patterns.