---
name: tags
description: use it when you need to create tags for api tests
---

- Observe the existing tags: `tests/app/utils/tags.ts`
- **If feature is a new one**, create a new tag, that replicates this feature. For example, for all CRUD methods regarding courses, use `courses` tag

- **If you create test for existing feature**, select the existing tag

- **For writing tests for checking permissions**, use the existing `@permissions` tag

- **For negative tests with using invalid data types**, use the existing `@invalidDataTypes` tag
