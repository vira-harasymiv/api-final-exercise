---
name: test-deleting
description: use it when you have to test endpoints for deleting (DELETE)
---

- **If you have methods to take the updated item by id**, include it to test if the item has been really deleted. For example:

```ts
await test.step("Check if the course has been deleting", async () => {
  const responseGet = await coursesController.getCourseById(courseId, {
    failOnStatusCode: false,
  });
  await checkMandatoryHeaders(response);
  await checkNotFoundStatusCode(responseGet);
  await test.step("Verify the error message in the response", async () => {
    const jsonGet = await responseGet.json();
    expect.soft(jsonGet).toBe("Course not found");
  });
});
```

- Include negative test on checking deleting by non-existing ID

- Always include tests for checking 401 and 403 errors;
