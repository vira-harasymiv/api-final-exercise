import { BaseController } from "../controllers/Base/BaseController";
import { Endpoints } from "../utils/Endpoints";
import { CourseUpdateBody, RequestOptions } from "../utils/interfaces";

export class CoursesController extends BaseController {
  private coursesEndpoint = Endpoints.coursesEndpoint;

  //POST request to create a new course
  createCourse(data?: { title: string }, options?: RequestOptions) {
    return this.post(this.coursesEndpoint, { title: data?.title }, options);
  }

  //POST request to create a new course using invalid data
  createInvalidCourse(data?: { title: any }, options?: RequestOptions) {
    return this.post(
      this.coursesEndpoint,
      { title: data?.title },
      { ...options, failOnStatusCode: false },
    );
  }

  //GET all courses
  getCourses(options?: RequestOptions) {
    return this.get(this.coursesEndpoint, options);
  }

  //GET course by ID
  getCourseById(courseId: string, options?: RequestOptions) {
    return this.get(`${this.coursesEndpoint}/${courseId}`, options);
  }

  deleteCourseById(courseId: string, options?: RequestOptions) {
    return this.delete(`${this.coursesEndpoint}/${courseId}`, options);
  }

  //PATCH request to update a course
  updateCourse(
    courseId: string,
    data?: CourseUpdateBody,
    options?: RequestOptions,
  ) {
    return this.patch(`${this.coursesEndpoint}/${courseId}`, data, options);
  }
}
