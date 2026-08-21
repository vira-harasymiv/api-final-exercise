import { APIResponse, expect, test } from "@playwright/test";
import { z, ZodType } from "zod";

async function generalHeaders(response: APIResponse) {
  const headers = response.headers();
  expect.soft(headers["connection"]).toBe("keep-alive");
  expect.soft(headers["content-type"]).toBe("application/json");
  expect.soft(headers["date"]).toBeTruthy();
  expect.soft(headers["transfer-encoding"]).toBe("chunked");
}
export async function checkMandatoryHeaders(response: APIResponse) {
  await test.step("Verify headers", async () => {
    const headers = response.headers();
    await generalHeaders(response);
    expect
      .soft(headers["vary"])
      .toBe(
        "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
      );
  });
}

export async function checkAcceptEncodingHeaders(response: APIResponse) {
  await test.step("Verify headers", async () => {
    const headers = response.headers();
    await generalHeaders(response);
    expect.soft(headers["vary"]).toBe("Accept-Encoding");
  });
}

export async function checkBadStatusCode(response: APIResponse) {
  await checkMandatoryHeaders(response);
  await test.step("Verify response", async () => {
    const json = await response.json();
    expect.soft(response.status()).toBe(400);
    expect.soft(response.statusText()).toBe("Bad Request");
  });
}

export async function checkNotFoundStatusCode(response: APIResponse) {
  await checkMandatoryHeaders(response);
  await test.step("Verify response", async () => {
    const json = await response.json();
    expect.soft(response.status()).toBe(404);
    expect.soft(response.statusText()).toBe("Not Found");
  });
}

export async function checkUnauthorizedStatusCode(response: APIResponse) {
  const json = await response.json();
  await checkAcceptEncodingHeaders(response);
  expect.soft(response.status()).toBe(401);
  expect.soft(response.statusText()).toBe("Unauthorized");
  expect.soft(json.error).toBe("Unauthorized");
}

export async function checkOKStatusCode(response: APIResponse) {
  await checkMandatoryHeaders(response);
  await test.step("Verify if the status Code is 200 OK", async () => {
    expect.soft(response.status()).toBe(200);
    expect.soft(response.statusText()).toBe("OK");
  });
}

export async function checkCreatedStatusCode(response: APIResponse) {
  await checkMandatoryHeaders(response);
  await test.step("Verify if the status Code is 201 Created", async () => {
    expect.soft(response.status()).toBe(201);
    expect.soft(response.statusText()).toBe("Created");
  });
}

export async function checkForbiddenStatusCode(response: APIResponse) {
  await checkMandatoryHeaders(response);
  await test.step("Verify if the status Code is  403 Forbidden", async () => {
    expect.soft(response.status()).toBe(403);
    expect.soft(response.statusText()).toBe("Forbidden");
  });
}

export async function checkSchema<Schema extends ZodType>(
  json: z.infer<Schema>,
  schema: Schema,
  errorMessage: string = "JSON does NOT match the expected schema",
) {
  await test.step("Verify that json corresponds to schema", async () => {
    const result = schema.safeParse(json);
    expect.soft(result.success, errorMessage).toBeTruthy();
  });
}
