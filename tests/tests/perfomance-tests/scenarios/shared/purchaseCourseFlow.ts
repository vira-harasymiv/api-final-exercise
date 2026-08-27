import { sleep, check } from "k6";
import { Trend } from "k6/metrics";
import { DojoApiController } from "../../controllers/DojoApiController.ts";
import { checkStatus } from "../../utils/commonCheck.ts";
import { randomUser } from "../../utils/randomUser.ts";
import { ADMIN_EMAIL, ADMIN_PASSWORD, COURSE_PRICE } from "../../config/env.ts";

export interface SetupData {
  courseId: string;
  adminToken: string;
}

// custom trends - one per request in the client purchase flow
const registerDuration = new Trend("register_duration_time", true);
const loginDuration = new Trend("login_duration_time", true);
const purchaseCourseDuration = new Trend("purchase_course_duration", true);
const listPurchasesDuration = new Trend("list_purchases_duration_time", true);

const dojoApi = new DojoApiController();

// Runs once before the load starts: logs in as admin and creates a single
// paid, published course that every virtual user will purchase.
export function setupCourse(): SetupData {
  const adminToken = dojoApi.loginAsAdmin(ADMIN_EMAIL, ADMIN_PASSWORD);

  const courseId = dojoApi.createPublishedCourse(
    adminToken,
    `Perf Test Course ${Date.now()}`,
    COURSE_PRICE,
  );

  return { courseId, adminToken };
}

// Runs once per iteration: registers a brand-new client, logs them in, and
// purchases the course prepared in setup(). A distinct user per iteration is
// required because a repeat purchase by the same user returns 409.
export function purchaseCourseIteration({ courseId }: SetupData) {
  const user = randomUser();

  const { res: registerRes } = dojoApi.register(
    user.name,
    user.email,
    user.password,
  );
  checkStatus(registerRes);
  registerDuration.add(registerRes.timings.duration);

  sleep(1);

  const { res: loginRes, token } = dojoApi.loginWithPassword(
    user.email,
    user.password,
  );
  checkStatus(loginRes);
  loginDuration.add(loginRes.timings.duration);

  sleep(1);

  const { res: purchaseRes, purchaseId } = dojoApi.purchaseCourse(
    token as string,
    courseId,
  );
  checkStatus(purchaseRes);
  check(purchaseRes, {
    "purchase id is not empty": () => purchaseId != undefined,
  });
  purchaseCourseDuration.add(purchaseRes.timings.duration);

  sleep(1);

  const { res: listRes } = dojoApi.getMyPurchases(token as string);
  checkStatus(listRes);
  listPurchasesDuration.add(listRes.timings.duration);

  sleep(1);
}

// Runs once after the load finishes: removes the course created in setup().
export function teardownCourse({ adminToken, courseId }: SetupData) {
  const res = dojoApi.deleteCourse(adminToken, courseId);
  checkStatus(res);
}
