---
name: test-updating
description: use it when you have to test endpoints for updating (PUT and PATCH)
---

- **If you have methods to take the updated item by id**, include it to test if the item has been really updated. For example:

```ts
await test.step("Verify if a price has been updated", async () => {
  const responseGet = await test.step("Get the updated course", async () => {
    return await coursesController.getCourseById(courseId, {
      failOnStatusCode: true,
    });
  });
  const jsonGet = await responseGet.json();
  expect.soft(json.price).toBe(jsonGet.price);
});
```

- **Test response body properties** to check if all properties have been updated

- **If you can update one property or several properties**, test if other properties remain unchanged after updating only one property. For example:

```ts
await test.step("Verify if other fields remain unchanged", async () => {
  expect.soft(json.id).toBe(courseId);
  expect.soft(json.title).toBe(courseTitle);
  expect.soft(json.description).toBeNull;
  expect.soft(json.imageUrl).toBeNull;
  expect.soft(json.price).toBe(price.toString());
  expect.soft(json.outcomes).toBeNull;
  expect.soft(json.requirements).toBeNull;
  expect.soft(json.authorName).toBeNull;
  expect.soft(json.authorRole).toBeNull;
  expect.soft(categoryId).toBeNull;
  expect.soft(categoryName).toBeNull;
});
```

- **Prepare test data to update in advance. Clear it too**. For example:

```ts
test.beforeEach(
  "Prepare test data: create the course",
  async ({ coursesController, categoriesController }) => {
    courseTitle = "New Course" + Math.floor(Math.random() * 1_000);
    categoryName = "New Category" + Math.floor(Math.random() * 1_000);

    const responseCourseCreate =
      await test.step("Create a new resource", async () => {
        return await coursesController.createCourse(
          { title: courseTitle },
          { failOnStatusCode: true },
        );
      });
    const jsonCourseCreate = await responseCourseCreate.json();
    courseId = jsonCourseCreate.id;
  },
);

test.afterEach(
  "Delete the created course",
  async ({ coursesController, categoriesController }) => {
    await test.step("Delete the created course", async () => {
      await coursesController.deleteCourseById(courseId, {
        failOnStatusCode: true,
      });
    });
  },
);
```

- **Include tests for checking invalid data types**.

- **If you have string values in the request body**, test empty strings and strings containing only with spaces

- **If you have character limits**, use Boundary Values analysis. For example, limit is up to 3 chars, then test 2 chars (negative value) and 3 chars (positive values)

- **For required fields in the request body**, test updating without them. For example, if name, password are required for updating, there should be 2 tests: updating without password, updating without name

- **For optional fields in the request body**, test at least one test that include ALL of them and other test, that includes several or one optional field

- **If you update item using its ID**, test response on updating it using non-existing id.

- **If you use already created item to update**, test updating using its non-existing value. For example:

```ts
test("Update course using non-existing category ID - should be error", async ({
  coursesController,
}) => {
  const courseBuilder = new CourseBuilder()
    .withCategoryIds(["non-existing"])
    .build();
  const responseUpdate =
    await test.step("Update course using non-existing category ID", async () => {
      return await coursesController.updateCourse(courseId, courseBuilder, {
        failOnStatusCode: false,
      });
    });
});
```

- Always include tests for checking 401 and 403 errors;
