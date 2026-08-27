//Request body shape for POST /learning-paths - title and instructor.name are required;
//description, modules, categoryIds, video, and certificate are optional (built via LearningPathBuilder)
export interface LearningPathModuleInput {
  title?: string;
  description?: string;
  position?: number;
}

export interface LearningPathVideoInput {
  title?: string;
  videoId?: string;
}

export interface LearningPathCertificateInput {
  name?: string;
  description?: string;
  templateUrl?: string;
}

export interface LearningPathInstructorInput {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface LearningPathBody {
  title?: string;
  description?: string;
  modules?: LearningPathModuleInput[];
  categoryIds?: string[];
  video?: LearningPathVideoInput;
  certificate?: LearningPathCertificateInput;
  instructor?: LearningPathInstructorInput;
}
