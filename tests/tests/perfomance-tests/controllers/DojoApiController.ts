import http from "k6/http";
import { check } from "k6";
import { BASE_URL } from "../config/env.ts";

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface RegisterResponse {
  id: string;
}

interface CourseResponse {
  id: string;
}

interface ChapterResponse {
  id: string;
}

interface PurchaseResponse {
  id: string;
}

const jsonHeaders = { "Content-Type": "application/json" };

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export class DojoApiController {
  // === Client flow - exercised on every iteration of the load test ===

  register(name: string, email: string, password: string) {
    const res = http.post(
      `${BASE_URL}/api/auth/register`,
      JSON.stringify({ name, email, password }),
      { headers: jsonHeaders, tags: { name: "register" } },
    );

    check(res, { "register status is 201": (r) => r.status === 201 });

    const json = res.json() as unknown as RegisterResponse;
    return { res, userId: json?.id };
  }

  loginWithPassword(email: string, password: string) {
    const res = http.post(
      `${BASE_URL}/api/oauth/token`,
      JSON.stringify({ grant_type: "password", email, password }),
      { headers: jsonHeaders, tags: { name: "login" } },
    );

    check(res, { "login status is 200": (r) => r.status === 200 });

    const json = res.json() as unknown as TokenResponse;
    return { res, token: json?.access_token };
  }

  purchaseCourse(token: string, courseId: string, promoCode?: string) {
    const res = http.post(
      `${BASE_URL}/api/courses/${courseId}/purchase`,
      JSON.stringify(promoCode ? { promoCode } : {}),
      { headers: authHeaders(token), tags: { name: "purchaseCourse" } },
    );

    const json = res.json() as unknown as PurchaseResponse;
    return { res, purchaseId: json?.id };
  }

  getMyPurchases(token: string) {
    const res = http.get(`${BASE_URL}/api/purchases`, {
      headers: authHeaders(token),
      tags: { name: "getMyPurchases" },
    });

    return { res };
  }

  // === Admin setup/teardown helpers - run once outside the measured load ===

  loginAsAdmin(email: string, password: string): string {
    const { res, token } = this.loginWithPassword(email, password);
    check(res, { "admin login status is 200": (r) => r.status === 200 });
    return token as string;
  }

  createPublishedCourse(
    adminToken: string,
    title: string,
    price: number,
  ): string {
    const createRes = http.post(
      `${BASE_URL}/api/courses`,
      JSON.stringify({ title }),
      { headers: authHeaders(adminToken) },
    );
    check(createRes, { "setup: course created": (r) => r.status === 201 });
    const courseId = (createRes.json() as unknown as CourseResponse).id;

    const updateRes = http.patch(
      `${BASE_URL}/api/courses/${courseId}`,
      JSON.stringify({
        description: "Course used for performance testing",
        imageUrl: "https://freecatphotoapp.com",
        price,
      }),
      { headers: authHeaders(adminToken) },
    );
    check(updateRes, { "setup: course updated": (r) => r.status === 200 });

    const chapterRes = http.post(
      `${BASE_URL}/api/courses/${courseId}/chapters`,
      JSON.stringify({ title: "Chapter 1" }),
      { headers: authHeaders(adminToken) },
    );
    check(chapterRes, { "setup: chapter created": (r) => r.status === 201 });
    const chapterId = (chapterRes.json() as unknown as ChapterResponse).id;

    const publishChapterRes = http.patch(
      `${BASE_URL}/api/courses/${courseId}/chapters/${chapterId}`,
      JSON.stringify({ isPublished: true }),
      { headers: authHeaders(adminToken) },
    );
    check(publishChapterRes, {
      "setup: chapter published": (r) => r.status === 200,
    });

    const publishCourseRes = http.patch(
      `${BASE_URL}/api/courses/${courseId}/publish`,
      null,
      { headers: authHeaders(adminToken) },
    );
    check(publishCourseRes, {
      "setup: course published": (r) => r.status === 200,
    });

    return courseId;
  }

  deleteCourse(adminToken: string, courseId: string) {
    return http.del(`${BASE_URL}/api/courses/${courseId}`, null, {
      headers: authHeaders(adminToken),
    });
  }
}
