import { BaseController } from "../controllers/Base/BaseController";
import { Endpoints } from "../utils/Endpoints";

export class CoursesController extends BaseController {
  private coursesEndpoint = Endpoints.coursesEndpoint;

  //POST request to create a new course
  async createCourse(
    data?: { title: string },
    options?: {
      headers?: { Authorization: string };
      failOnStatusCode?: boolean;
    },
  ) {
    const response = await this.request.post(this.coursesEndpoint, {
      data: { title: data?.title },
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
    return response;
  }

  //POST request to create a new course using invalid data
  async createInvalidCourse(
    data?: { title: any },
    options?: {
      headers?: { Authorization: string };
    },
  ) {
    const response = await this.request.post(this.coursesEndpoint, {
      data: { title: data?.title },
      headers: options?.headers,
      failOnStatusCode: false,
    });
    return response;
  }

  //GET all courses
  async getCourses(options?: {
    headers?: { Authorization: string };
    failOnStatusCode?: boolean;
  }) {
    const response = await this.request.get(this.coursesEndpoint, {
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
    return response;
  }

  //GET course by ID
  async getCourseById(
    courseId: string,
    options?: {
      headers?: { Authorization: string };
      failOnStatusCode?: boolean;
    },
  ) {
    const response = await this.request.get(
      `${this.coursesEndpoint}/${courseId}`,
      {
        headers: options?.headers,
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
    return response;
  }

  //DELETE course by ID
  async deleteCourseById(
    courseId: string,
    options?: {
      headers?: { Authorization: string };
      failOnStatusCode?: boolean;
    },
  ) {
    const response = await this.request.delete(
      `${this.coursesEndpoint}/${courseId}`,
      {
        headers: options?.headers,
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
    return response;
  }

  //PATCH request to update a course
  async updateCourse(
    courseId: string,
    data?: {
      title?: string;
      description?: string;
      imageUrl?: string;
      price?: number;
      categoryIds?: string[];
      outcomes?: string[];
      requirements?: string[];
      authorName?: string;
      authorRole?: string;
    },
    options?: {
      headers?: { Authorization: string };
      failOnStatusCode?: boolean;
    },
  ) {
    const response = await this.request.patch(
      `${this.coursesEndpoint}/${courseId}`,
      {
        data,
        headers: options?.headers,
        failOnStatusCode: options?.failOnStatusCode,
      },
    );
    return response;
  }
}
