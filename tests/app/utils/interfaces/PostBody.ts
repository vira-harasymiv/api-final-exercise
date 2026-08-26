//Request body shape for POST /posts and PATCH /posts/{postId} - all fields optional
//here since PATCH allows partial updates (built via PostBuilder); POST additionally
//requires `title` at the call site
export interface PostBody {
  title?: string;
  excerpt?: string;
  content?: string;
  imageUrl?: string;
  tagIds?: string[];
  isPublished?: boolean;
}
