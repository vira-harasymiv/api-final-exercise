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
