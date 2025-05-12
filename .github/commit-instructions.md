# Commit Message Guidelines

Follow this structured commit message format:

```
<type>(<optional scope>): <concise description>

- <specific change in one file or component>
- <specific change in another file or component>
- <additional changes, each on a new line>
```

## Rules

- Limit the first line (header) to 100 characters or less
- Type is mandatory and must be lowercase
- After the header, provide a bullet-point list of specific changes
- Each bullet point should start with a hyphen and describe one specific change
- Be specific about which files or components were modified

## Type Options

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect the meaning of code (formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools
- `revert`: Reverting a previous commit

## Example

```
feat: implement two-factor authentication with backup codes

- Updated styles in index.vue for better branding and dark mode support
- Refactored server/trpc/init.ts to streamline authentication middleware
- Simplified auth router in server/trpc/routers/auth.ts with better error handling
- Improved user experience in auth store by enhancing error handling
- Added new composables for handling change password and 2FA forms with validation
- Created a new two-factor authentication page with dynamic input handling
- Implemented backup codes for two-factor authentication
```
