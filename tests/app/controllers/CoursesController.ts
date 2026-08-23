import { BaseController } from "../controllers/Base/BaseController";
import { Endpoints } from "../utils/Endpoints";
import { ChapterUpdateBody } from "../utils/interfaces/ChapterUpdateBody";
import { CourseUpdateBody } from "../utils/interfaces/CourseUpdateBode";

export class CoursesController extends BaseController {
  private coursesEndpoint = Endpoints.coursesEndpoint;

  //POST request to create a new course
  async createCourse(
    data?: { title: string },
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.post(this.coursesEndpoint, {
      data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //POST request to create a new course using invalid data
  async createInvalidCourse(
    data?: { title: any },
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.post(this.coursesEndpoint, {
      data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //GET all courses
  async getCourses(options?: {
    headers?: { Authorization?: string };
    failOnStatusCode?: boolean;
  }) {
    return await this.request.get(this.coursesEndpoint, {
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //GET course by ID
  async getCourseById(
    courseId: string,
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.get(`${this.coursesEndpoint}/${courseId}`, {
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //DELETE course by ID
  async deleteCourseById(
    courseId: string,
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.delete(`${this.coursesEndpoint}/${courseId}`, {
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //PATCH request to update a course
  async updateCourse(
    courseId: string,
    data?: CourseUpdateBody,
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.patch(`${this.coursesEndpoint}/${courseId}`, {
      data,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
  }

  //PATCH (Publish) course by ID
  async publishCourseById(
    courseId: string,
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.patch(
      `${this.coursesEndpoint}/${courseId}/publish`,
      {
        headers: options?.headers,
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
  }

  //POST - add a chapter to a course
  async addChapterToCourse(
    courseId: string,
    data?: { title: string },
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.post(
      `${this.coursesEndpoint}/${courseId}/chapters`,
      {
        data,
        headers: options?.headers,
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
  }

  //PATCH - update the chapter
  async updateChapter(
    courseId: string,
    chapterId: string,
    data?: ChapterUpdateBody,
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.patch(
      `${this.coursesEndpoint}/${courseId}/chapters/${chapterId}`,
      {
        data,
        headers: options?.headers,
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
  }

  //DELETE - delete the chapter
  async deleteChapter(
    courseId: string,
    chapterId: string,
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    return await this.request.delete(
      `${this.coursesEndpoint}/${courseId}/chapters/${chapterId}`,
      {
        headers: options?.headers,
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
  }
}
