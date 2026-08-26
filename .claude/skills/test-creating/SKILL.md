---
name: test-creating
description: use it when you have to POST any request
---

- Include positive tests with all required properties in the request body

- **If you have optional and required properties in the request body**, create **2 positive tests**: POST request using only required fields and POST request using required and optional fields. For example:

```ts
test("Verify taking token with Password Grant and only required fields", async ({
  oauthController,
}) => {});

test("Verify taking token with Password Grant and optional scope field", async ({
  oauthController,
}) => {});
```

And **negative tests** without each of the required property.

- **If you can get the created item by ID**, get it to test if the item has been created. For example:

```ts
await test.step("Check if the course has been created", async () => {
  const responseCreated = await coursesController.getCourseById(courseId, {
    failOnStatusCode: true,
  });
  const jsonCreated = await responseCreated.json();
  const { categories, chapters, attachments, ...expectedJson } = jsonCreated;
  expect.soft(json).toMatchObject(expectedJson);
});
```

- **Include negative tests with invalid data types for each property**

- **If you have string values in the request body**, test empty strings and strings containing only with spaces

- **If you have character limits**, use Boundary Values analysis. For example, limit is up to 3 chars, then test 2 chars (negative value) and 3 chars (positive values)

- Always include tests for checking 401 and 403 errors;
