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
