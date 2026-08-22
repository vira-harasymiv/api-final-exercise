export interface CourseUpdateBody {
  title?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  categoryIds?: string[];
  outcomes?: string[];
  requirements?: string[];
  authorName?: string;
  authorRole?: string;
}

export interface RequestOptions {
  headers?: { Authorization: string };
  failOnStatusCode?: boolean;
}

export interface ChapterUpdateBody {
  title?: string;
  description?: string;
  videoUrl?: string;
  timecodes?: string;
  notes?: string;
  homework?: string;
  isPublished?: boolean;
  isFree?: boolean;
}
