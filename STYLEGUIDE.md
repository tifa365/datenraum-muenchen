# Code Style Guide

## General rules

- **Language:** English for code and documentation
- **Line length:** Aim for max. 100 characters, better 80.
- **Indentation:** 2
- **Directory structure**: Group by function and/or type (`auth`, `views`, `composables`, ...)
- Keep changes consistent with existing project conventions when in doubt.

## Further guidelines

### Naming
- Upper `CamelCase` or `PascalCase` for vue components
- Lower `camelCase` for composables, variables, functions, and non-vue components
- Upper `SNAKE_CASE` for constants
- `kebab-case` for filenames

### Implementation
- Composition API over Options API for new developments
- Prefer typescript
- Prefer semantic html
- Make use of vue's built-in reactivity using `ref` and `computed`
- Use `aria-*` attributes, labels, and ensure accessibility
- Use single quotes for strings
- No semicolons unless required

### Imports

- Group by:
  1. External dependencies
  2. Internal modules
  3. Styles and assets
- Beispiel:
  ```ts
  import { computed, type ComputedRef } from 'vue'
  import { useQuery } from '@tanstack/vue-query'

  import { useAuthStore } from '@/stores/authStore.js'

  import './Button.scss'
  ```

### Performance
- Lazy-load routes and large components
- Avoid using too many watchers
- Cache expensive calculations with computed

### QA
- Use unit tests for logic
- Use component tests for UI
- Use mocks for required network, stores, and/or services
- Catch errors, log details for developers, and show user-friendly error messages
- Make use of and fix ESLint warnings or errors

### Committing

- Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) guidelines
- See also [CONTRIBUTING.md](./CONTRIBUTING.md)
