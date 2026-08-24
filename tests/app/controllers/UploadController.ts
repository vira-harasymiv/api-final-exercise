import { readFile } from "node:fs/promises";
import { BaseController } from "./Base/BaseController";
import { Endpoints } from "../utils/Endpoints";

export class UploadController extends BaseController {
  private uploadFileEndpoint = Endpoints.uploadFieEndpoint;

  async uploadFile(
    multipart: {
      file: { name: string; mimeType: string; relativePath: string };
    },
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    const buffer = await readFile(multipart.file.relativePath);
    const formData = new FormData();
    formData.append(
      "file",
      new File([buffer], multipart.file.name, {
        type: multipart.file.mimeType,
      }),
    );
    const response = await this.request.post(this.uploadFileEndpoint, {
      multipart: formData,
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
    return response;
  }

  async downloadFile(
    path: string,
    options?: {
      headers?: { Authorization?: string };
      failOnStatusCode?: boolean;
    },
  ) {
    const response = await this.request.get(`${path}`, {
      headers: options?.headers,
      failOnStatusCode: options?.failOnStatusCode,
    });
    return response;
  }
}
