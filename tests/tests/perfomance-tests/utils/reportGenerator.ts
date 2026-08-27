// @ts-expect-error -- remote k6 module, no local type declarations
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

function getTimestamp(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(
    d.getHours(),
  )}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

/**
 * Generates the object expected by k6's handleSummary():
 * writes an HTML report to tests/tests/perfomance-tests/reports/<testName>_<timestamp>.html
 *
 * The path k6 writes to is resolved relative to the working directory k6
 * was invoked from (the repo root, per this suite's README/npm scripts),
 * not relative to this file - hence the full path from the repo root here.
 */
export function generateReport(testName: string, data: any) {
  const fileName = `tests/tests/perfomance-tests/reports/${testName}_${getTimestamp()}.html`;

  return {
    [fileName]: htmlReport(data),
    stdout: "",
  };
}
