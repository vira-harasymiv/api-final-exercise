//Request body shape for PATCH /courses/{courseId} - all fields optional since a
//test may only need to update a subset (built via CourseBuilder)
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
