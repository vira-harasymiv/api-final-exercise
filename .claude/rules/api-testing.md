---
paths: ["tests/**"]
---

## API Tests

- **Built-in `request` (`APIRequestContext`)** for HTTP requests — do not use `axios`, `node-fetch`, etc. This ensures a shared configuration and better integration.
- **Extract helper logic into Controllers** (`tests/app/controllers/*Controller.ts`). A test should only contain a sequence of steps and assertions, not low-level request details.
- **Use controllers from fixtures**
- **Validate the response body, not just the status code.** Verify the structure and types using a Zod schema (`json-schemas/`): `Schema.safeParse(json)` → `expect(result.success).toBeTruthy()`.
- **Use `expect.soft` for non-critical assertions** (e.g., headers, specific fields) so that a single failure does not halt the execution of subsequent assertions.
- **Data isolation and cleanup.** Store payloads and expected schemas in separate fixtures or factories. Entities created via POST/PUT requests must be deleted in `afterEach` or `afterAll` hooks.
- **Centralized authorization.** Obtain authentication tokens via a global setup or fixtures; do not duplicate the login logic in every test.
- **Cover negative scenarios** (4xx/5xx): invalid payloads, missing permissions, incorrect parameters — do not test only the happy path.
- **Focus on the critical path.** Prioritize key business scenarios instead of chasing after every edge case

- DON'T DO this when you return some value:

```ts
return (await response.json()).id as string;
```

- DO this instead:

```ts
const json = await response.json();
const id = json["id"];

return id;
```
