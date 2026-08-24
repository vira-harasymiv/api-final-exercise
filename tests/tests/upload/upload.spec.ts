import { uploadedFileSchema } from "../../app/json-schemas/uploadSchemas";
import {
  checkAcceptEncodingHeaders,
  checkBadStatusCode,
  checkCreatedStatusCode,
  checkForbiddenStatusCode,
  checkMandatoryHeaders,
  checkSchema,
  checkUnauthorizedStatusCode,
} from "../../app/utils/expect-helpers";
import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";
let mime = require("mime-types");

//Positive test cases for uploading JPEG file
test.describe(
  "POST /upload - upload JPEG file: positive tests",
  { tag: [TAG.smoke, TAG.regression, TAG.uploadFile] },
  () => {
    test("Upload non-empty JPEG file - should be successful", async ({
      uploadController,
    }) => {
      const response =
        await test.step("Upload file in the JPEG format", async () => {
          return await uploadController.uploadFile(
            {
              file: {
                name: "jpeg-example",
                mimeType: mime.lookup("jpeg"),
                relativePath: "tests/tests/uploads/images/sample.jpg",
              },
            },
            { failOnStatusCode: true },
          );
        });

      await checkCreatedStatusCode(response);
      const json = await response.json();
      await checkSchema(
        json,
        uploadedFileSchema,
        "JSON response of the uploaded file does not match schema",
      );
      await checkMandatoryHeaders(response);
      await test.step("Check properties in the response body", async () => {
        expect.soft(json.url).toContain("/api/uploads/");
        expect.soft(json.name).toBe("jpeg-example");
        expect.soft(json.size).toBe(14322);
        expect.soft(json.type).toBe(mime.lookup("jpeg"));
      });
    });

    test("Upload empty JPEG file - should be successful", async ({
      uploadController,
    }) => {
      const response =
        await test.step("Upload empty file in the JPEG format", async () => {
          return await uploadController.uploadFile(
            {
              file: {
                name: "jpeg-0B",
                mimeType: mime.lookup("jpeg"),
                relativePath: "tests/tests/uploads/images/jpeg_0B.jpg",
              },
            },
            { failOnStatusCode: true },
          );
        });
      await checkCreatedStatusCode(response);
      const json = await response.json();
      await checkMandatoryHeaders(response);
      await test.step("Check properties in the response body", async () => {
        expect.soft(json.url).toContain("/api/uploads/");
        expect.soft(json.name).toBe("jpeg-0B");
        expect.soft(json.size).toBe(0);
        expect.soft(json.type).toBe(mime.lookup("jpeg"));
      });
    });

    //!500 Internal Server Error is received after uploading file with size 49.99 MB
    test("Upload JPEG file with size 49.99MB - should be successful", async ({
      uploadController,
    }) => {
      const response =
        await test.step("Upload JPEG file with size 49.99MB", async () => {
          return await uploadController.uploadFile(
            {
              file: {
                name: "jpeg-49.99MB",
                mimeType: mime.lookup("jpeg"),
                relativePath: "tests/tests/uploads/images/jpeg_49.99MB.jpg",
              },
            },
            { failOnStatusCode: true },
          );
        });
      expect(response.status()).toBeLessThan(500);
    });
  },
);

//Negative test cases for uploading JPEG file (unsupported format, JPEG files > 50MB)
test.describe(
  "POST /upload - upload JPEG files: negative tests",
  { tag: [TAG.negative, TAG.regression, TAG.uploadFile] },
  () => {
    test("Upload unsupported format - should be error", async ({
      uploadController,
    }) => {
      const response =
        await test.step("Upload any unsupported format, for example JS file", async () => {
          return await uploadController.uploadFile(
            {
              file: {
                name: "test-js",
                mimeType: mime.lookup("js"),
                relativePath: "tests/tests/uploads/test.js",
              },
            },
            { failOnStatusCode: false },
          );
        });
      await checkMandatoryHeaders(response);
      await checkBadStatusCode(response);
      const json = await response.json();
      await test.step("Check the error message", () => {
        expect(json.error).toContain("File type not allowed:");
      });
    });

    //!500 Internal Server Error is received after uploading file with size 50.l MB
    test("Upload JPEG file with size 50.l MB - should be error", async ({
      uploadController,
    }) => {
      const response =
        await test.step("Upload JPEG file with size 50.l MB", async () => {
          return await uploadController.uploadFile(
            {
              file: {
                name: "jpeg-50.l MB",
                mimeType: mime.lookup("jpeg"),
                relativePath: "tests/tests/uploads/images/jpeg_50.1MB.jpg",
              },
            },
            { failOnStatusCode: false },
          );
        });
      expect(response.status()).toBeLessThan(500);
    });

    //!500 Internal Server Error is received after uploading file with size 50.0l MB
    test("Upload JPEG file with size 50.01 MB - should be error", async ({
      uploadController,
    }) => {
      const response =
        await test.step("Upload JPEG file with size 50.01 MB", async () => {
          return await uploadController.uploadFile(
            {
              file: {
                name: "jpeg-50.01 MB",
                mimeType: mime.lookup("jpeg"),
                relativePath: "tests/tests/uploads/images/jpeg_50.01MB.jpg",
              },
            },
            { failOnStatusCode: false },
          );
        });
      expect(response.status()).toBeLessThan(500);
    });

    //!500 Internal Server Error is received after uploading file with size 50 MB
    test("Upload JPEG file with size 50 MB - should be error", async ({
      uploadController,
    }) => {
      const response =
        await test.step("Upload JPEG file with size 50 MB", async () => {
          return await uploadController.uploadFile(
            {
              file: {
                name: "jpeg-50 MB",
                mimeType: mime.lookup("jpeg"),
                relativePath: "tests/tests/uploads/images/jpeg_50MB.jpg",
              },
            },
            { failOnStatusCode: false },
          );
        });
      expect(response.status()).toBeLessThan(500);
    });
  },
);

//Negative test cases for uploading JPEG file (empty name, name = path & path = name, DOCX file declared as image/jpeg )
test.describe(
  "POST /upload - upload file: name and content-type validation gaps",
  { tag: [TAG.negative, TAG.regression, TAG.uploadFile] },
  () => {
    //!Server does not validate the file name - an empty name is accepted and stored under a ".bin" extension instead of returning a 400 error
    test("Upload file with empty name - should be error", async ({
      uploadController,
    }) => {
      const response =
        await test.step("Upload JPEG file with an empty name", async () => {
          return await uploadController.uploadFile(
            {
              file: {
                name: "",
                mimeType: mime.lookup("jpeg"),
                relativePath: "tests/tests/uploads/images/sample.jpg",
              },
            },
            { failOnStatusCode: false },
          );
        });
      await checkBadStatusCode(response);
    });

    //!Server does not sanitize the file name - a path traversal string is accepted and echoed back as-is instead of returning a 400 error
    test("Upload file with a path traversal name - should be error", async ({
      uploadController,
    }) => {
      const response =
        await test.step("Upload JPEG file with a path traversal name", async () => {
          return await uploadController.uploadFile(
            {
              file: {
                name: "../../../etc/passwd.jpg",
                mimeType: mime.lookup("jpeg"),
                relativePath: "tests/tests/uploads/images/sample.jpg",
              },
            },
            { failOnStatusCode: false },
          );
        });
      await checkBadStatusCode(response);
    });

    //!Server only checks the declared mimeType against its allow-list and never verifies it matches the actual file content, so a DOCX file declared as image/jpeg is accepted instead of returning a 400 error
    test("Upload file with mimeType mismatching actual content - should be error", async ({
      uploadController,
    }) => {
      const response =
        await test.step("Upload DOCX file content declared as image/jpeg", async () => {
          return await uploadController.uploadFile(
            {
              file: {
                name: "fake-image.jpg",
                mimeType: mime.lookup("jpeg"),
                relativePath: "tests/tests/uploads/docs/sample.docx",
              },
            },
            { failOnStatusCode: false },
          );
        });
      await checkBadStatusCode(response);
    });
  },
);

//Negative test cases on 401/403 errors
test.describe("POST /upload - upload JPEG file without auth and admin permission", () => {
  test.use({ isAuthorized: false });

  let token: string;

  test.beforeAll(
    "Take token without admin permission",
    async ({ apiClient }) => {
      const result = await apiClient.loginWithCredentialsOfNewClient(
        "new client",
        ["read", "write"],
      );
      token = result.token;
    },
  );

  test("Upload JPEG file without authorization - should be 401 error", async ({
    uploadController,
  }) => {
    const response =
      await test.step("Upload JPEG file without authorization", async () => {
        return await uploadController.uploadFile(
          {
            file: {
              name: "jpeg-example",
              mimeType: mime.lookup("jpeg"),
              relativePath: "tests/tests/uploads/images/sample.jpg",
            },
          },
          { failOnStatusCode: false },
        );
      });
    await checkAcceptEncodingHeaders(response);
    await checkUnauthorizedStatusCode(response);
  });

  test("Upload JPEG file without admin permission - should be 403 error", async ({
    uploadController,
  }) => {
    const response =
      await test.step("Upload JPEG file without admin permission", async () => {
        return await uploadController.uploadFile(
          {
            file: {
              name: "jpeg-example",
              mimeType: mime.lookup("jpeg"),
              relativePath: "tests/tests/uploads/images/sample.jpg",
            },
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false,
          },
        );
      });
    await checkMandatoryHeaders(response);
    await checkForbiddenStatusCode(response);
  });
});
