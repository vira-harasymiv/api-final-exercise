import { APIRequestContext } from "@playwright/test";
import { OauthController } from "../OauthController";
import { ClientsController } from "../ClientsController";
import { passwordGrantPayload } from "../../../tests/oauth2/testData/payloads";
import { UserInfoController } from "../UseInfoController";
import { CoursesController } from "../CoursesController";
import { CourseBuilder } from "../../utils/builders/CourseBuilder";
import { ChapterBuilder } from "../../utils/builders/ChapterBuilder";

export class ApiClient {
  private oauthController: OauthController;
  private clientsController: ClientsController;
  private userInfoController: UserInfoController;
  private coursesController: CoursesController;

  constructor(request: APIRequestContext) {
    this.oauthController = new OauthController(request);
    this.clientsController = new ClientsController(request);
    this.userInfoController = new UserInfoController(request);
    this.coursesController = new CoursesController(request);
  }

  //Login to the app using credentials of the created new client
  async loginWithCredentialsOfNewClient(name: string, scopes: Array<string>) {
    const responseLoginAsAdmin = await this.oauthController.withPasswordGrant(
      passwordGrantPayload,
      { failOnStatusCode: true },
    );
    const jsonLoginAsAdmin = await responseLoginAsAdmin.json();
    const adminToken = jsonLoginAsAdmin.access_token;

    const responseCreate = await this.clientsController.createClient(
      { name: name, scopes: scopes },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        failOnStatusCode: true,
      },
    );
    const jsonCreate = await responseCreate.json();
    const clientId = jsonCreate.clientId;
    const clientSecret = jsonCreate.clientSecret;

    const responseLogin = await this.oauthController.withClientIdAndSecret(
      {
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      },
      { failOnStatusCode: true },
    );

    const jsonLogin = await responseLogin.json();
    const token = jsonLogin.access_token;
    const refreshToken = jsonLogin.refresh_token;

    return { responseLogin, clientId, token, refreshToken };
  }

  //Login as known client and get info about him using GET method
  async getClientInfo(clientId: string, clientSecret: string) {
    const responseLogin = await this.oauthController.withClientIdAndSecret(
      {
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      },
      { failOnStatusCode: true },
    );

    const jsonLogin = await responseLogin.json();
    const token = jsonLogin.access_token;

    const responseGet = await this.userInfoController.getUserInfo({
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: true,
    });
    const jsonGet = await responseGet.json();
    return jsonGet;
  }

  //Creates a published course with a non-empty description/image and the given price, plus a
  //single published chapter - the minimum state a course must be in to be purchasable
  async createPurchasableCourse(title: string, price: number) {
    //Create a new course
    const responseCreate = await this.coursesController.createCourse(
      { title: title },
      { failOnStatusCode: true },
    );
    const jsonCreate = await responseCreate.json();
    const courseId: string = jsonCreate.id;

    const updateCourseBody = new CourseBuilder()
      .withDescription("Purchasable course description")
      .withImageUrl("https://freecatphotoapp.com")
      .withPrice(price)
      .build();

    //Update this course so that the description, image URL, price are not empty
    await this.coursesController.updateCourse(courseId, updateCourseBody, {
      failOnStatusCode: true,
    });

    //Add a chapter to the updated course
    const responseChapter = await this.coursesController.addChapterToCourse(
      courseId,
      { title: "Chapter 1" },
      { failOnStatusCode: true },
    );
    const jsonChapter = await responseChapter.json();
    const chapterId: string = jsonChapter.id;

    const chapterPayload = new ChapterBuilder().withIsPublished(true).build();

    //Publish the added chapter
    await this.coursesController.updateChapter(
      courseId,
      chapterId,
      chapterPayload,
      {
        failOnStatusCode: true,
      },
    );

    //Publish the course
    await this.coursesController.publishCourseById(courseId, {
      failOnStatusCode: true,
    });
    return { courseId, chapterId };
  }
}
