# Contributing to Context Studio Automation Framework

Thank you for your interest in contributing to the Context Studio Automation Framework! This document provides guidelines and best practices for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Documentation](#documentation)
- [Review Process](#review-process)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow IBM's code of conduct and security policies

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. **Development Environment Setup**
   ```bash
   git clone <repository-url>
   cd context-studio-automation
   npm ci
   npx playwright install chromium
   ```

2. **Environment Configuration**
   - Copy `config/environments/example.env` to `config/environments/test.env`
   - Fill in required credentials (see [README.md](README.md#environment-setup))

3. **Authentication**
   ```bash
   npx ts-node hooks/global-setup.ts
   ```

4. **Verify Setup**
   ```bash
   npm run test:sanity
   ```

### Understanding the Codebase

Read these documents before making changes:
- [Architecture Overview](ARCHITECTURE.md) - Framework structure
- [Implementation Plan](IMPLEMENTATION_PLAN.md) - Development roadmap
- [Quick Start Guide](QUICK_START.md) - Framework walkthrough

## Development Workflow

### 1. Create an Issue

Before starting work:
- Check existing issues to avoid duplication
- Create a new issue describing the bug/feature
- Wait for approval from maintainers
- Get assigned to the issue

### 2. Create a Branch

```bash
git checkout main
git pull origin main
git checkout -b <branch-type>/<issue-number>-<short-description>
```

See [Branch Naming Conventions](#branch-naming-conventions) below.

### 3. Make Changes

- Follow [Coding Standards](#coding-standards)
- Write tests for new functionality
- Update documentation as needed
- Keep commits atomic and focused

### 4. Test Your Changes

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run sanity tests
npm run test:sanity

# Run specific tests
npx playwright test path/to/test.spec.ts

# Run secret scan
detect-secrets scan --baseline .secrets.baseline
```

### 5. Submit Pull Request

See [Pull Request Process](#pull-request-process) below.

## Coding Standards

### TypeScript Guidelines

1. **Strict Mode**
   - All code must pass TypeScript strict mode
   - No `any` types allowed (enforced by ESLint)
   - Use proper type annotations

   ```typescript
   // ❌ Bad
   function processData(data: any) {
     return data.value;
   }

   // ✅ Good
   interface DataType {
     value: string;
   }
   
   function processData(data: DataType): string {
     return data.value;
   }
   ```

2. **Naming Conventions**
   - Classes: `PascalCase` (e.g., `SchemaListPage`)
   - Functions/Methods: `camelCase` (e.g., `createSchema`)
   - Constants: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_TIMEOUT`)
   - Interfaces: `PascalCase` with descriptive names (e.g., `CreateSchemaOptions`)
   - Files: `kebab-case` (e.g., `schema-list.page.ts`)

3. **File Organization**
   ```
   src/
   ├── pages/          # Page Object Model classes
   ├── api/            # API client classes
   ├── fixtures/       # Test fixtures
   ├── utils/          # Utility functions
   ├── constants/      # Constants and enums
   └── tests/          # Test files
   ```

### Page Object Model

1. **Structure**
   ```typescript
   import { Page, Locator } from '@playwright/test';
   import { BasePage } from '../base/BasePage';

   export class MyPage extends BasePage {
     // Locators
     readonly myButton: Locator;
     readonly myInput: Locator;

     constructor(page: Page) {
       super(page);
       this.myButton = page.locator('[data-testid="my-button"]');
       this.myInput = page.locator('[data-testid="my-input"]');
     }

     // Actions
     async clickButton(): Promise<void> {
       await this.myButton.click();
     }

     async fillInput(value: string): Promise<void> {
       await this.myInput.fill(value);
     }
   }
   ```

2. **Best Practices**
   - Extend `BasePage` for common functionality
   - Use `data-testid` attributes for selectors
   - Keep actions atomic and reusable
   - Return promises for async operations
   - Add JSDoc comments for complex methods

### API Client Pattern

```typescript
import { BaseApiClient } from './base/BaseApiClient';

export class MyApiClient extends BaseApiClient {
  async getData(id: string): Promise<DataType> {
    return this.get<DataType>(`/api/data/${id}`);
  }

  async createData(data: CreateDataRequest): Promise<DataType> {
    return this.post<DataType>('/api/data', data);
  }
}
```

### Test Writing Guidelines

1. **Test Structure**
   ```typescript
   import { test, expect } from '../../../fixtures/ui-fixtures';
   import { allure } from 'allure-playwright';
   import { step } from '../../../utils/allure-helper';

   test.describe('Feature Name @tag1 @tag2', () => {
     test.beforeEach(async ({ page }) => {
       allure.feature('Module Name');
       allure.story('Feature Story');
     });

     test('should do something @sanity', async ({ myPage }) => {
       allure.severity('critical');

       await step('Step description', async () => {
         // Test implementation
       });

       await step('Verify result', async () => {
         await expect(myPage.result).toBeVisible();
       });
     });
   });
   ```

2. **Test Tags**
   - `@sanity` - Critical path tests
   - `@regression` - Full regression suite
   - `@ui` - UI tests
   - `@api` - API tests
   - `@schema` / `@context` / `@mcp` - Module-specific

3. **Assertions**
   - Use Playwright's built-in assertions
   - Prefer `toBeVisible()` over `toBeTruthy()`
   - Add timeout for flaky elements
   - Use soft assertions for non-critical checks

### Waiting Strategies

**❌ Never use arbitrary waits:**
```typescript
// Bad
await page.waitForTimeout(5000);
```

**✅ Use Playwright's auto-waiting:**
```typescript
// Good
await expect(element).toBeVisible({ timeout: 10000 });
await page.waitForLoadState('networkidle');
await page.waitForURL(/expected-url/);
```

### Error Handling

```typescript
// Wrap risky operations
try {
  await riskyOperation();
} catch (error) {
  logger.error({ action: 'riskyOperation', error: String(error) });
  throw new Error(`Operation failed: ${error.message}`);
}
```

## Testing Requirements

### Before Submitting PR

1. **All tests must pass**
   ```bash
   npm run test:sanity
   ```

2. **No linting errors**
   ```bash
   npm run lint
   ```

3. **Type checking passes**
   ```bash
   npm run type-check
   ```

4. **Secret scan passes**
   ```bash
   detect-secrets scan --baseline .secrets.baseline
   ```

### Writing New Tests

1. **Test Coverage**
   - Add tests for new features
   - Update tests for modified features
   - Include both positive and negative scenarios
   - Test edge cases

2. **Test Independence**
   - Tests must run independently
   - No dependencies between tests
   - Clean up test data after execution

3. **Test Data**
   - Use dynamic test data (timestamps, UUIDs)
   - Don't hardcode environment-specific values
   - Clean up created resources

## Pull Request Process

### 1. PR Title Format

```
<type>(<scope>): <description>

Examples:
feat(schema): add schema validation tests
fix(auth): resolve SSO timeout issue
docs(readme): update installation steps
refactor(api): improve error handling
test(mcp): add hybrid query tests
```

### 2. PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Closes #<issue-number>

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing Done
- [ ] Sanity tests pass
- [ ] Regression tests pass (if applicable)
- [ ] Manual testing completed
- [ ] Secret scan passes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No new warnings
```

### 3. Review Process

1. **Automated Checks**
   - CI pipeline must pass
   - Secret scan must pass
   - All tests must pass

2. **Code Review**
   - At least 1 approval required
   - Address all review comments
   - Re-request review after changes

3. **Merge**
   - Squash and merge preferred
   - Delete branch after merge

## Branch Naming Conventions

Format: `<type>/<issue-number>-<short-description>`

### Types

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/modifications
- `chore/` - Maintenance tasks

### Examples

```
feat/123-add-schema-validation
fix/456-resolve-auth-timeout
docs/789-update-readme
refactor/101-improve-api-client
test/202-add-mcp-tests
chore/303-update-dependencies
```

## Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Tests
- `chore` - Maintenance

### Examples

```
feat(schema): add JSON-LD schema validation

Implement validation for JSON-LD schemas including:
- Node type validation
- Edge relationship validation
- Required field checks

Closes #123
```

```
fix(auth): resolve SSO timeout on slow networks

Increase timeout from 30s to 60s and add retry logic
for SSO authentication to handle slow network conditions.

Fixes #456
```

### Rules

1. Use imperative mood ("add" not "added")
2. Don't capitalize first letter
3. No period at the end
4. Limit subject line to 50 characters
5. Wrap body at 72 characters
6. Reference issues in footer

## Documentation

### When to Update Documentation

Update documentation when you:
- Add new features
- Change existing functionality
- Fix bugs that affect usage
- Add new configuration options
- Change API endpoints

### Documentation Files

- `README.md` - Main documentation
- `ARCHITECTURE.md` - Framework architecture
- `QUICK_START.md` - Quick start guide
- `TROUBLESHOOTING.md` - Common issues
- `docs/` - Specialized guides

### Documentation Standards

1. **Clear and Concise**
   - Use simple language
   - Provide examples
   - Include code snippets

2. **Up-to-Date**
   - Update with code changes
   - Remove outdated information
   - Add version information

3. **Well-Organized**
   - Use headings and sections
   - Add table of contents
   - Include cross-references

## Review Process

### For Contributors

1. **Self-Review**
   - Review your own code first
   - Check for typos and formatting
   - Verify all tests pass
   - Ensure documentation is updated

2. **Respond to Feedback**
   - Address all comments
   - Ask questions if unclear
   - Make requested changes
   - Re-request review

### For Reviewers

1. **Review Checklist**
   - [ ] Code follows style guidelines
   - [ ] Tests are comprehensive
   - [ ] Documentation is updated
   - [ ] No security issues
   - [ ] Performance considerations
   - [ ] Error handling is proper

2. **Feedback Guidelines**
   - Be constructive and respectful
   - Explain reasoning
   - Suggest improvements
   - Approve when satisfied

## Questions?

- Check [Troubleshooting Guide](TROUBLESHOOTING.md)
- Ask in #context-studio-automation Slack channel
- Create a GitHub issue
- Contact the team lead

## Thank You!

Your contributions make this framework better for everyone. Thank you for taking the time to contribute!

---

**Made with Bob** 🤖