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
