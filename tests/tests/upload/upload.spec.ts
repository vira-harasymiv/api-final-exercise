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
        await test.step("Upload non-empty, up to 50MB file in the JPEG format", async () => {
          return await uploadController.uploadFile(
            {
              file: {
                name: "jpeg-example",
                mimeType: mime.lookup("jpeg"),
                relativePath: "tests/tests/upload/uploads/images/sample.jpg",
              },
            },
            { failOnStatusCode: true },
          );
        });

      await checkCreatedStatusCode(response);
      const json = await response.json();
      await checkSchema(json, uploadedFileSchema);
      await checkMandatoryHeaders(response);
      await test.step("Verify properties in the response body", async () => {
        expect.soft(json.url).toContain("/api/uploads/");
        expect.soft(json.name).toBe("jpeg-example");
        expect.soft(json.size).toBe(14322);
        expect.soft(json.type).toBe(mime.lookup("jpeg"));
      });
    });

    //!Here the uploading of empty file should be clarified
    test("Upload empty JPEG file - should be successful", async ({
      uploadController,
    }) => {
      const response =
        await test.step("Upload JPEG file with size = 0MB", async () => {
          return await uploadController.uploadFile(
            {
              file: {
                name: "jpeg-0B",
                mimeType: mime.lookup("jpeg"),
                relativePath: "tests/tests/upload/uploads/images/jpeg_0B.jpg",
              },
            },
            { failOnStatusCode: true },
          );
        });
      await checkCreatedStatusCode(response);
      const json = await response.json();
      await checkMandatoryHeaders(response);
      await test.step("Verify properties in the response body", async () => {
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
                relativePath:
                  "tests/tests/upload/uploads/images/jpeg_49.99MB.jpg",
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
  "POST /upload - upload JPEG files: negative tests on unsupported format, large files",
  { tag: [TAG.negative, TAG.regression, TAG.uploadFile] },
  () => {
    test("Upload unsupported format - should be 400 error", async ({
      uploadController,
    }) => {
      const response =
        await test.step("Upload any unsupported format, for example JS file", async () => {
          return await uploadController.uploadFile(
            {
              file: {
                name: "test-js",
                mimeType: mime.lookup("js"),
                relativePath: "tests/tests/upload/uploads/test.js",
              },
            },
            { failOnStatusCode: false },
          );
        });
      await checkMandatoryHeaders(response);
      await checkBadStatusCode(response);
      const json = await response.json();
      await test.step("Verify if the error message informs that the file type is not allowed", () => {
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
                relativePath:
                  "tests/tests/upload/uploads/images/jpeg_50.1MB.jpg",
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
                relativePath:
                  "tests/tests/upload/uploads/images/jpeg_50.01MB.jpg",
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
                relativePath: "tests/tests/upload/uploads/images/jpeg_50MB.jpg",
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
  "POST /upload - upload file: negative tests regarding name and content-type validation gaps",
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
                relativePath: "tests/tests/upload/uploads/images/sample.jpg",
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
        await test.step("Upload DOCX file and declare it as image/jpeg", async () => {
          return await uploadController.uploadFile(
            {
              file: {
                name: "fake-image.jpg",
                mimeType: mime.lookup("jpeg"),
                relativePath: "tests/tests/upload/uploads/docs/sample.docx",
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
test.describe(
  "POST /upload - upload JPEG file without authorization and admin permission",
  { tag: [TAG.negative, TAG.regression, TAG.uploadFile, TAG.permissions] },
  () => {
    test.use({ isAuthorized: false });

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
                relativePath: "tests/tests/upload/uploads/images/sample.jpg",
              },
            },
            { failOnStatusCode: false },
          );
        });
      await checkAcceptEncodingHeaders(response);
      await checkUnauthorizedStatusCode(response);
      const json = await response.json();
      await test.step("Verify the error message in the response", async () => {
        expect.soft(json.error).toBe("Unauthorized");
      });
    });

    test("Upload JPEG file as a client with READ permission - should be 403 error", async ({
      uploadController,
      readClientToken,
    }) => {
      const response =
        await test.step("Upload JPEG file as a client with READ permission", async () => {
          return await uploadController.uploadFile(
            {
              file: {
                name: "jpeg-example",
                mimeType: mime.lookup("jpeg"),
                relativePath: "tests/tests/upload/uploads/images/sample.jpg",
              },
            },
            {
              headers: { Authorization: `Bearer ${readClientToken}` },
              failOnStatusCode: false,
            },
          );
        });
      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      await test.step("Verify the error message in the response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Forbidden");
      });
    });

    test("Upload JPEG file as a client with READ and WRITE permissions - should be 403 error", async ({
      uploadController,
      readWriteClientToken,
    }) => {
      const response =
        await test.step("Upload JPEG file as a client with READ and WRITE permissions", async () => {
          return await uploadController.uploadFile(
            {
              file: {
                name: "jpeg-example",
                mimeType: mime.lookup("jpeg"),
                relativePath: "tests/tests/upload/uploads/images/sample.jpg",
              },
            },
            {
              headers: { Authorization: `Bearer ${readWriteClientToken}` },
              failOnStatusCode: false,
            },
          );
        });
      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      await test.step("Verify the error message in the response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Forbidden");
      });
    });

    test("Upload JPEG file as a client with READ, WRITE, and ADMIN permissions - should be 403 error", async ({
      uploadController,
      readWriteAdminClientToken,
    }) => {
      const response =
        await test.step("Upload JPEG file as a client with READ, WRITE, and ADMIN permissions", async () => {
          return await uploadController.uploadFile(
            {
              file: {
                name: "jpeg-example",
                mimeType: mime.lookup("jpeg"),
                relativePath: "tests/tests/upload/uploads/images/sample.jpg",
              },
            },
            {
              headers: { Authorization: `Bearer ${readWriteAdminClientToken}` },
              failOnStatusCode: false,
            },
          );
        });
      await checkMandatoryHeaders(response);
      await checkForbiddenStatusCode(response);
      await test.step("Verify the error message in the response", async () => {
        const json = await response.json();
        expect.soft(json.error).toBe("Forbidden");
      });
    });
  },
);
