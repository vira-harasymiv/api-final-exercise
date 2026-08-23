//Request body shape for PATCH .../chapters/{chapterId} - all fields optional since a
//test may only need to update a subset (built via ChapterBuilder)
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
