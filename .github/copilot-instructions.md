# Copilot Instructions

This project is a modern web application boilerplate built with Nuxt 3, offering a production-ready foundation for your projects. The application leverages MySQL with Drizzle ORM for data management, Tailwind CSS v4 for styling. The project is set up with TypeScript and uses ESLint for linting.
The project is structured in a way that allows for easy scalability and maintainability. The code is organized into modules, and each module has its own directory. The modules are further divided into standard Nuxt 3 directories.
The application is designed to be responsive and works well on both desktop and mobile devices. The UI is built using Tailwind CSS v4 and Nuxt-UI v3.
The application uses tRPC with custom Nuxt integration for API calls and has a custom authentication system. The authentication system uses JWT tokens stored in HTTP-only cookies and is designed to be secure and easy to use. The project also uses Nuxt i18n for internationalization and Pinia with persistence for state management.

## Coding Standards

- Use camelCase for variable and function names.
- Use PascalCase for component names.
- Use camelCase for file names.
- Use UPPER_SNAKE_CASE for global constants.
- Use lower_snake_case for field names on schema.
- Use PascalCase with descriptive names for types/interfaces.
- Use single quotes for strings.
- Use 2 spaces for indentation.
- Don't use semicolons at the end of statements.
- Use arrow functions for callbacks and component methods.
- Use async/await for asynchronous code.
- Use const for constants and let for variables that will be reassigned.
- Use destructuring for objects and arrays.
- Use template literals for strings that contain variables.
- Keep functions small and focused on single responsibilities.
- Add JSDoc comments for complex functions.
- Define explicit return types for functions.
- Use interfaces for object shapes and extend when necessary.
- Create type-safe API endpoints using tRPC.
- Never use `any` type; prefer `unknown` when type is uncertain.
- Use enums for fixed sets of values.
- Use `@ts-expect-error` with comments rather than `@ts-ignore`.
- Define proper types for API responses and form data.
- Follow the DRY (Don't Repeat Yourself) principle in code.
- Use meaningful variable and function names that describe their purpose.
- Use the Composition API with `<script setup>` syntax for components.
- Extract reusable logic into composables.
- Use props validation with proper types.
- Emit properly typed events.
- Use slots for flexible component composition.
- Use Pinia for global state management with setup syntax.
- Use local component state for UI-specific state.
- Use the i18n system for all user-facing text.
- Define translations in TS files under `i18n/`
- Use Zod schemas for validation in tRPC endpoints.
- Organize API routes by resource/domain.
- Use Skeleton loaders for loading states.
- Use rem on tailwind arbitrary values.
