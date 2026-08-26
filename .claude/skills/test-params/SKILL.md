---
name: test-params
description: use it when your endpoint contains path or query parameters
---

- **DO NOT write query params in url**. Use `params`option:

```ts
async getArticles(
    params?: {
      offset?: number;
      limit?: number;
      tag?: string;
      author?: string;
      favorited?: boolean;
    },
    options?: { failOnStatusCode?: boolean},
  ) {
    const response = await this.request.get(this.articleEndpoint, {
      params: params,
      failOnStatusCode: options?.failOnStatusCode,
    });
    return response;
  }
```

- Create api tests to test endpoint with query params and without them **if these query params are optional**

- ALWAYS create positive tests for valid values for query and path params.

- **If path parameter is ID of any item**, test existing ID and non-existing ID

- **If you have param that identifies the item's index**, include positive tests: when index is any item of the array (e.g., third), index is the first item, index is the last item. Include negative tests: test cases when item's index is negative, 0, and > the array length

- **If you have param that identifies the number of items to show** (e.g., limit), test positive cases (when limit is < the array length, limit = array length, limit = 1) and negative cases (limit > array length, limit = 0, limit = any negative value)

- **If you have params indicating sorting**, then verify if results sorted by this params are shown

- **If you have params indicating ordering**, test both cases: ASC and DESC
