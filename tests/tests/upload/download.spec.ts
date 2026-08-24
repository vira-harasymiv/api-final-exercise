import {
  checkNotFoundStatusCode,
  checkOKStatusCode,
} from "../../app/utils/expect-helpers";
import { test, expect } from "../fixtures/api-fixtures";
import { TAG } from "../../app/utils/tags";

//Test scenario for downloading JPEG file
test.describe(
  "GET /uploads/{path} - download file should be successful",
  { tag: [TAG.smoke, TAG.regression, TAG.uploadFile] },
  () => {
    const jpegSize = 14322;
    let jpegUrl: string;
    let mime = require("mime-types");
    const jpegMimeType = mime.lookup("jpeg");

    test.beforeAll("Prepare test data", async ({ uploadController }) => {
      //Prepare test data:
      const response =
        await test.step("Upload file in the JPEG format", async () => {
          return await uploadController.uploadFile(
            {
              file: {
                name: "jpeg-example",
                mimeType: jpegMimeType,
                relativePath: "tests/tests/upload/uploads/images/sample.jpg",
              },
            },
            { failOnStatusCode: true },
          );
        });
      jpegUrl = (await response.json()).url;
    });

    test("Download file should be successful", async ({ uploadController }) => {
      const response = await test.step("Download the JPEG file", async () => {
        return await uploadController.downloadFile(jpegUrl, {
          failOnStatusCode: true,
        });
      });
      await checkOKStatusCode(response);
      await test.step("Check headers", async () => {
        const headers = response.headers();
        expect.soft(headers["connection"]).toBe("keep-alive");
        expect.soft(headers["content-type"]).toBe("application/octet-stream");
        expect.soft(headers["date"]).toBeTruthy();
        expect.soft(headers["transfer-encoding"]).toBe("chunked");
      });
      await test.step("Check the file size", async () => {
        const body = await response.body();
        const buffer = Buffer.from(body);
        expect(buffer.byteLength).toBe(jpegSize);
      });
    });
  },
);

//Negative tests (downloading file using non-existing path)
test.describe(
  "GET /uploads/{path} - download file: negative cases",
  { tag: [TAG.negative, TAG.regression, TAG.uploadFile] },
  () => {
    test("Download file using non-existing path - should be 404 error", async ({
      uploadController,
    }) => {
      const response = await test.step("Download the JPEG file", async () => {
        return await uploadController.downloadFile("abc123.pdf", {
          failOnStatusCode: false,
        });
      });
      await test.step("Check headers", async () => {
        const headers = response.headers();
        expect.soft(headers["connection"]).toBe("keep-alive");
        expect.soft(headers["content-type"]).toBe("text/html; charset=utf-8");
        expect.soft(headers["date"]).toBeTruthy();
        expect.soft(headers["transfer-encoding"]).toBe("chunked");
      });
      await checkNotFoundStatusCode(response);
    });
  },
);
