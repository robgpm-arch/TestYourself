export type CourseCatalog = {
  id: string;
  name: string;
  slug: string;
  emoji?: string | null;
  colorHex?: string | null;
  description?: string | null;
  tags?: string[];
};

export type CourseInstance = {
  id: string;
  catalogId: string;
  name: string;
  medium: string;
  board?: string | null;
  examId?: string | null;
  order?: number;
  enabled?: boolean;
};
