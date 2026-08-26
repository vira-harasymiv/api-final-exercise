---
name: create-api-tests-controller
description: when you need to generate API test controller, to hold all required methods for test execution
---

- create new controllers here: `tests/app/controllers`

- **if feature is a new one** - create a new controller for it. Each new controller should extend BaseController: `tests\app\controllers\Base\BaseController.ts`. **If feature is the existing one**, add the relevant methods and properties (if applicable) to the existing controller.

- The **controller's name** should replicate the feature name. Properties should be private and replicate the relevant endpoint. For example, CoursesController contains all methods regarding getting, deleting, updating, and creating courses:

```typescript
export class CoursesController extends BaseController {
  private coursesEndpoint = Endpoints.coursesEndpoint;

  //GET all courses
  async getCourses(){}

  //GET course by ID
  async getCourseById(){}

  //POST - add a chapter to a course
  async addChapterToCourse(){}

  //PATCH - update the chapter
  async updateChapter() {},

  //DELETE - delete the chapter
  async deleteChapter(){}
}
```

- endpoints write in the separate class: `tests\app\utils\Endpoints.ts`. Endpoints should be static and readonly. Add explanation between endpoints groups. Follow this example:

```typescript
export class Endpoints {
  static readonly baseEndpoint = "/api/";

  //OAuth2 endpoints
  static readonly oauthEndpoint = this.baseEndpoint + "oauth/";
  static readonly tokenEndpoint = this.oauthEndpoint + "token";
}
```

- New created controller should be added to api-fixture (`tests\tests\fixtures\api-fixtures.ts`). For example:

```typescript
type Fixtures = {
  yourNewController: YourNewController;
};

export const test = base.extend<Fixtures>({
  yourNewController: async ({ request }, use) => {
    await use(new YourNewController(request));
  },
});
```

- **If you new 2 controllers or more for implementing ONE method**, create this method in ApiController:
  `tests\app\controllers\Base\ApiClient.ts`

-**If request body has more than 3 properties**, use builder pattern for creating it. How to use builder pattern read this skill:
`.claude\skills\builder-pattern`
