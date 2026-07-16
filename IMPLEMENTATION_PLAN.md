# Context Studio Automation Framework - Implementation Plan

## Phase 1: Foundation Setup (Priority: Critical)

### 1.1 Project Configuration Files

#### package.json
**Purpose**: Define project dependencies, scripts, and metadata

**Key Dependencies**:
- `@playwright/test`: ^1.40.0 - Core testing framework
- `allure-playwright`: ^2.15.0 - Allure reporting integration
- `allure-commandline`: ^2.25.0 - Allure CLI for report generation
- `winston`: ^3.11.0 - Structured logging
- `dotenv`: ^16.3.1 - Environment variable management
- `typescript`: ^5.3.0 - TypeScript compiler

**Scripts**:
```json
{
  "test:ui": "playwright test --project=ui",
  "test:api": "playwright test --project=api",
  "test:all": "playwright test",
  "test:sanity": "playwright test --grep @sanity",
  "test:regression": "playwright test --grep @regression",
  "test:tag": "playwright test",
  "test:env": "playwright test",
  "report:generate": "allure generate allure-results --clean -o allure-report",
  "report:open": "allure open allure-report",
  "report:clean": "rm -rf allure-results allure-report"
}
```

#### tsconfig.json
**Purpose**: TypeScript compiler configuration with strict mode and path aliases

**Key Settings**:
- `strict: true` - Enable all strict type checking
- `noImplicitAny: true` - Disallow implicit any types
- `baseUrl: "."` - Base directory for module resolution
- Path aliases:
  - `@pages/*` → `pages/*`
  - `@utils/*` → `utils/*`
  - `@api/*` → `api/*`
  - `@fixtures/*` → `fixtures/*`
  - `@constants/*` → `constants/*`
  - `@config/*` → `config/*`
  - `@hooks/*` → `hooks/*`

#### .eslintrc.json
**Purpose**: Enforce code quality and prevent common issues

**Critical Rules**:
- `@typescript-eslint/no-explicit-any: error` - Ban any type
- `@typescript-eslint/no-floating-promises: error` - Require promise handling
- `no-restricted-syntax` - Ban `page.waitForTimeout()`

#### .prettierrc
**Purpose**: Consistent code formatting

**Settings**:
- `semi: true`
- `singleQuote: true`
- `tabWidth: 2`
- `printWidth: 100`

---

## Phase 2: Environment & Configuration (Priority: Critical)

### 2.1 Environment Files

#### config/environments/test.env
```env
BASE_URL=https://context-studio-test.ibm.com
API_BASE_URL=https://api.context-studio-test.ibm.com
AUTH_USERNAME=test_user@ibm.com
AUTH_PASSWORD=encrypted_password
DEFAULT_TIMEOUT=30000
INGESTION_POLL_TIMEOUT=300000
INGESTION_POLL_INTERVAL=5000
GITHUB_TEST_PAT=ghp_test_token
SHAREPOINT_TEST_URL=https://ibm.sharepoint.com/sites/test
LOG_LEVEL=info
```

#### config/environments/stage.env
Similar structure with stage URLs and credentials

#### config/environments/prod.env
Similar structure with production URLs and credentials

### 2.2 Environment Loader

#### config/env-loader.ts
**Purpose**: Load environment-specific configuration dynamically

**Interface**:
```typescript
interface EnvConfig {
  baseUrl: string;
  apiBaseUrl: string;
  authUsername: string;
  authPassword: string;
  defaultTimeout: number;
  ingestionPollTimeout: number;
  ingestionPollInterval: number;
  githubTestPat: string;
  sharepointTestUrl: string;
  logLevel: string;
}
```

**Functionality**:
- Read `testEnv` from `process.env.TEST_ENV` or CLI args
- Default to 'test' environment
- Load corresponding .env file using dotenv
- Parse and validate all required variables
- Export typed configuration object

---

## Phase 3: Constants & Test Data (Priority: High)

### 3.1 UI Selectors

#### constants/selectors.ts
**Purpose**: Centralized UI element selectors for maintainability

**Structure**:
```typescript
export const SELECTORS = {
  // Common
  HEADER: {
    LOGO: '[data-testid="app-logo"]',
    USER_MENU: '[data-testid="user-menu"]',
    LOGOUT: '[data-testid="logout-button"]'
  },
  
  // Schema Management
  SCHEMA: {
    LIST: {
      CREATE_BUTTON: '[data-testid="create-schema-button"]',
      SEARCH_INPUT: '[data-testid="schema-search"]',
      TABLE_ROW: '[data-testid="schema-row"]',
      EDIT_BUTTON: '[data-testid="edit-schema"]',
      DELETE_BUTTON: '[data-testid="delete-schema"]'
    },
    EDITOR: {
      NAME_INPUT: '[data-testid="schema-name"]',
      TYPE_SELECT: '[data-testid="schema-type"]',
      JSON_EDITOR: '[data-testid="json-editor"]',
      ADD_NODE: '[data-testid="add-node"]',
      ADD_EDGE: '[data-testid="add-edge"]',
      SAVE_BUTTON: '[data-testid="save-schema"]',
      PUBLISH_BUTTON: '[data-testid="publish-schema"]'
    }
  },
  
  // Context & Ingestion
  CONTEXT: {
    LIST: {
      CREATE_BUTTON: '[data-testid="create-context-button"]',
      CONTEXT_CARD: '[data-testid="context-card"]'
    },
    INGESTION: {
      UPLOAD_BUTTON: '[data-testid="upload-file"]',
      FILE_INPUT: 'input[type="file"]',
      CONNECT_SOURCE: '[data-testid="connect-source"]',
      SOURCE_TYPE_SELECT: '[data-testid="source-type"]',
      STATUS_INDICATOR: '[data-testid="ingestion-status"]'
    }
  },
  
  // MCP Exposure
  MCP: {
    TOOLS: {
      TOOL_CARD: '[data-testid="mcp-tool"]',
      EXECUTE_BUTTON: '[data-testid="execute-tool"]'
    },
    QUERY: {
      QUERY_TYPE: '[data-testid="query-type"]',
      QUERY_INPUT: '[data-testid="query-input"]',
      EXECUTE_BUTTON: '[data-testid="execute-query"]',
      RESULTS_PANEL: '[data-testid="query-results"]'
    }
  }
};
```

### 3.2 API Endpoints

#### constants/api-endpoints.ts
**Purpose**: Centralized API endpoint definitions

**Structure**:
```typescript
export const API_ENDPOINTS = {
  // Schema Management
  SCHEMA: {
    LIST: '/api/v1/schemas',
    CREATE: '/api/v1/schemas',
    GET: (id: string) => `/api/v1/schemas/${id}`,
    UPDATE: (id: string) => `/api/v1/schemas/${id}`,
    DELETE: (id: string) => `/api/v1/schemas/${id}`,
    PUBLISH: (id: string) => `/api/v1/schemas/${id}/publish`,
    VALIDATE: '/api/v1/schemas/validate'
  },
  
  // Context & Ingestion
  CONTEXT: {
    LIST: '/api/v1/contexts',
    CREATE: '/api/v1/contexts',
    GET: (id: string) => `/api/v1/contexts/${id}`,
    UPDATE: (id: string) => `/api/v1/contexts/${id}`,
    DELETE: (id: string) => `/api/v1/contexts/${id}`
  },
  
  INGESTION: {
    UPLOAD: '/api/v1/ingestion/upload',
    CONNECT_SOURCE: '/api/v1/ingestion/sources',
    STATUS: (jobId: string) => `/api/v1/ingestion/status/${jobId}`,
    SOURCES: '/api/v1/ingestion/sources'
  },
  
  // MCP Exposure
  MCP: {
    GET_CONTEXTS: '/api/v1/mcp/contexts',
    GET_METADATA: '/api/v1/mcp/metadata',
    GRAPH_QUERY: '/api/v1/mcp/query/graph',
    VECTOR_QUERY: '/api/v1/mcp/query/vector',
    HYBRID_QUERY: '/api/v1/mcp/query/hybrid',
    POST_EVENT: '/api/v1/mcp/events'
  }
};
```

### 3.3 Test Data

#### constants/test-data.ts
**Purpose**: Static test data and enums

**Content**:
```typescript
export enum SchemaType {
  JSON_LD = 'json-ld',
  CSV = 'csv',
  MANUAL = 'manual'
}

export enum IngestionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum SourceType {
  GITHUB = 'github',
  SHAREPOINT = 'sharepoint',
  MANUAL = 'manual'
}

export const TEST_SCHEMA_NAMES = {
  VALID: 'Test Schema Valid',
  INVALID: 'Test Schema Invalid',
  DUPLICATE: 'Test Schema Duplicate'
};

export const TEST_CONTEXT_NAMES = {
  DEFAULT: 'Test Context Default',
  WITH_INGESTION: 'Test Context With Ingestion'
};
```

---

## Phase 4: Core Infrastructure (Priority: Critical)

### 4.1 Logging

#### utils/logger.ts
**Purpose**: Structured logging with Winston

**Features**:
- Console and file transports
- Log levels: error, warn, info, debug
- Timestamp and metadata support
- Separate log files for errors
- JSON formatting for parsing

### 4.2 Authentication

#### utils/auth-helper.ts
**Purpose**: Handle IBM W3 SSO authentication and storageState management

**Key Functions**:
```typescript
async function authenticate(page: Page): Promise<void>
async function saveAuthState(context: BrowserContext): Promise<void>
async function loadAuthState(): Promise<string | undefined>
function isAuthStateValid(): Promise<boolean>
```

**Flow**:
1. Check if valid storageState exists
2. If not, navigate to login page
3. Fill IBM W3 SSO form (username, password)
4. Wait for successful authentication
5. Save storageState to `.auth/user.json`
6. Reuse storageState in subsequent tests

### 4.3 Playwright Configuration

#### playwright.config.ts
**Purpose**: Configure Playwright with two projects (ui, api)

**UI Project**:
- Browser: chromium
- Video: on-first-retry
- Screenshot: only-on-failure
- Trace: on-first-retry
- storageState: `.auth/user.json`

**API Project**:
- No browser
- Use APIRequestContext
- Auth via headers/cookies

**Global Settings**:
- Timeout: from env config
- Workers: 4 (parallel execution)
- Reporter: allure-playwright
- Global setup: `hooks/global-setup.ts`
- Global teardown: `hooks/global-teardown.ts`

---

## Phase 5: Page Object Model (Priority: High)

### 5.1 Base Page

#### pages/base-page.ts
**Purpose**: Common page functionality for all page objects

**Methods**:
- `waitForPageLoad()`
- `clickElement(selector: string)`
- `fillInput(selector: string, value: string)`
- `selectOption(selector: string, value: string)`
- `getText(selector: string)`
- `isVisible(selector: string)`
- `waitForElement(selector: string)`

### 5.2 Schema Management Pages

#### pages/schema/schema-list.page.ts
**Methods**:
- `navigateToSchemaList()`
- `clickCreateSchema()`
- `searchSchema(name: string)`
- `getSchemaByName(name: string)`
- `editSchema(name: string)`
- `deleteSchema(name: string)`

#### pages/schema/schema-editor.page.ts
**Methods**:
- `setSchemaName(name: string)`
- `selectSchemaType(type: SchemaType)`
- `addNode(nodeData: NodeData)`
- `addEdge(edgeData: EdgeData)`
- `saveSchema()`
- `publishSchema()`
- `validateSchema()`

#### pages/schema/schema-publish.page.ts
**Methods**:
- `confirmPublish()`
- `cancelPublish()`
- `getPublishStatus()`

### 5.3 Context & Ingestion Pages

#### pages/context/context-list.page.ts
**Methods**:
- `navigateToContextList()`
- `createContext(name: string, description: string)`
- `getContextByName(name: string)`
- `deleteContext(name: string)`

#### pages/context/ingestion.page.ts
**Methods**:
- `uploadFile(filePath: string)`
- `waitForIngestionComplete(timeout?: number)`
- `getIngestionStatus()`
- `cancelIngestion()`

#### pages/context/source-connection.page.ts
**Methods**:
- `connectGitHub(repoUrl: string, pat: string)`
- `connectSharePoint(siteUrl: string, credentials: object)`
- `disconnectSource(sourceId: string)`
- `getConnectedSources()`

### 5.4 MCP Exposure Pages

#### pages/mcp/mcp-tools.page.ts
**Methods**:
- `navigateToMCPTools()`
- `getAvailableTools()`
- `executeTool(toolName: string, params: object)`
- `getToolResult()`

#### pages/mcp/mcp-query.page.ts
**Methods**:
- `selectQueryType(type: 'graph' | 'vector' | 'hybrid')`
- `enterQuery(query: string)`
- `executeQuery()`
- `getQueryResults()`
- `exportResults(format: 'json' | 'csv')`

---

## Phase 6: API Client Layer (Priority: High)

### 6.1 Base API Client

#### api/base-api.ts
**Purpose**: Common API request handling with authentication

**Features**:
- Request/response logging
- Error handling and retry logic
- Authentication header management
- Request/response interceptors
- Timeout handling

**Methods**:
```typescript
async get<T>(endpoint: string, options?: RequestOptions): Promise<T>
async post<T>(endpoint: string, data: unknown, options?: RequestOptions): Promise<T>
async put<T>(endpoint: string, data: unknown, options?: RequestOptions): Promise<T>
async delete<T>(endpoint: string, options?: RequestOptions): Promise<T>
async patch<T>(endpoint: string, data: unknown, options?: RequestOptions): Promise<T>
```

### 6.2 Schema API

#### api/schema-api.ts
**Methods**:
- `listSchemas()`
- `createSchema(schemaData: SchemaData)`
- `getSchema(id: string)`
- `updateSchema(id: string, schemaData: SchemaData)`
- `deleteSchema(id: string)`
- `publishSchema(id: string)`
- `validateSchema(schemaData: SchemaData)`

### 6.3 Context API

#### api/context-api.ts
**Methods**:
- `listContexts()`
- `createContext(contextData: ContextData)`
- `getContext(id: string)`
- `updateContext(id: string, contextData: ContextData)`
- `deleteContext(id: string)`
- `uploadFile(contextId: string, file: Buffer, filename: string)`
- `connectSource(contextId: string, sourceConfig: SourceConfig)`
- `getIngestionStatus(jobId: string)`
- `pollIngestionStatus(jobId: string, timeout?: number)`

### 6.4 MCP API

#### api/mcp-api.ts
**Methods**:
- `getContexts()`
- `getMetadata(contextId: string)`
- `graphQuery(query: GraphQueryParams)`
- `vectorQuery(query: VectorQueryParams)`
- `hybridQuery(query: HybridQueryParams)`
- `postEvent(event: MCPEvent)`

---

## Phase 7: Test Fixtures (Priority: High)

### 7.1 Authentication Fixture

#### fixtures/auth.fixture.ts
**Purpose**: Provide authenticated page/context to tests

**Exports**:
```typescript
export const authFixture = base.extend<{
  authenticatedPage: Page;
  authenticatedContext: BrowserContext;
}>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: '.auth/user.json'
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  }
});
```

### 7.2 Page Fixture

#### fixtures/page.fixture.ts
**Purpose**: Provide page objects to tests

**Exports**:
```typescript
export const pageFixture = authFixture.extend<{
  schemaListPage: SchemaListPage;
  schemaEditorPage: SchemaEditorPage;
  contextListPage: ContextListPage;
  ingestionPage: IngestionPage;
  mcpToolsPage: MCPToolsPage;
  mcpQueryPage: MCPQueryPage;
}>({
  // Initialize all page objects
});
```

### 7.3 API Fixture

#### fixtures/api.fixture.ts
**Purpose**: Provide API clients to tests

**Exports**:
```typescript
export const apiFixture = base.extend<{
  schemaApi: SchemaAPI;
  contextApi: ContextAPI;
  mcpApi: MCPAPI;
}>({
  // Initialize all API clients
});
```

---

## Phase 8: Test Hooks (Priority: Medium)

### 8.1 Global Setup

#### hooks/global-setup.ts
**Purpose**: Run before all tests

**Tasks**:
- Load environment configuration
- Authenticate and save storageState
- Clean old reports
- Initialize logger
- Verify API connectivity

### 8.2 Global Teardown

#### hooks/global-teardown.ts
**Purpose**: Run after all tests

**Tasks**:
- Generate Allure report
- Clean up test data
- Archive logs
- Send notifications (optional)

---

## Phase 9: Test Suites (Priority: High)

### 9.1 UI Test Structure

Each test file should follow this pattern:
```typescript
import { test } from '@fixtures/page.fixture';
import { expect } from '@playwright/test';

test.describe('Schema Management - Create Schema @ui @schema @sanity', () => {
  test('should create a valid JSON-LD schema', async ({ schemaListPage, schemaEditorPage }) => {
    // Test implementation
  });
});
```

### 9.2 API Test Structure

Each test file should follow this pattern:
```typescript
import { test } from '@fixtures/api.fixture';
import { expect } from '@playwright/test';

test.describe('Schema API - CRUD Operations @api @schema @regression', () => {
  test('should create a schema via API', async ({ schemaApi }) => {
    // Test implementation
  });
});
```

### 9.3 Test Coverage Matrix

| Module | UI Tests | API Tests | Tags |
|--------|----------|-----------|------|
| Schema Creation | ✓ | ✓ | @schema @sanity |
| Schema Editing | ✓ | ✓ | @schema @regression |
| Schema Publishing | ✓ | ✓ | @schema @regression |
| Context Creation | ✓ | ✓ | @context @sanity |
| File Ingestion | ✓ | ✓ | @context @regression |
| GitHub Connection | ✓ | ✓ | @context @regression |
| SharePoint Connection | ✓ | ✓ | @context @regression |
| MCP Get Contexts | ✓ | ✓ | @mcp @sanity |
| MCP Graph Query | ✓ | ✓ | @mcp @regression |
| MCP Vector Query | ✓ | ✓ | @mcp @regression |
| MCP Hybrid Query | ✓ | ✓ | @mcp @regression |
| MCP Post Event | ✓ | ✓ | @mcp @regression |

---

## Phase 10: Utilities & Helpers (Priority: Medium)

### 10.1 Wait Helpers

#### utils/wait-helpers.ts
**Functions**:
- `waitForCondition(condition: () => boolean, timeout: number)`
- `waitForApiResponse(request: Promise, timeout: number)`
- `waitForElementState(page: Page, selector: string, state: string)`
- `retryOperation(operation: () => Promise, maxRetries: number)`

### 10.2 Data Generators

#### utils/data-generators.ts
**Functions**:
- `generateSchemaName(prefix?: string): string`
- `generateContextName(prefix?: string): string`
- `generateRandomString(length: number): string`
- `generateTestEmail(): string`
- `generateTimestamp(): string`

### 10.3 File Helpers

#### utils/file-helpers.ts
**Functions**:
- `readTestFile(filename: string): Buffer`
- `createTempFile(content: string, extension: string): string`
- `cleanupTempFiles(): void`
- `validateFileExists(path: string): boolean`

---

## Phase 11: Test Data Files (Priority: Low)

### 11.1 Schema Templates

#### test-data/schemas/valid-schema.json
Valid JSON-LD schema for testing

#### test-data/schemas/invalid-schema.json
Invalid schema for negative testing

### 11.2 Sample Files

#### test-data/files/sample-document.pdf
Sample PDF for ingestion testing

#### test-data/files/sample-csv.csv
Sample CSV for ingestion testing

---

## Phase 12: Documentation & CI/CD (Priority: Medium)

### 12.1 README.md

**Sections**:
- Project overview
- Prerequisites
- Installation steps
- Configuration guide
- Running tests
- Viewing reports
- Troubleshooting
- Contributing guidelines

### 12.2 CI/CD Configuration

#### .github/workflows/test.yml
**Triggers**:
- Push to main/develop
- Pull requests
- Scheduled (nightly)

**Jobs**:
- Install dependencies
- Run linting
- Run UI tests
- Run API tests
- Generate Allure report
- Upload artifacts

---

## Implementation Priority

### Phase 1 (Week 1): Foundation
1. ✓ Project configuration files
2. ✓ Environment setup
3. ✓ Constants definition
4. ✓ Logging infrastructure

### Phase 2 (Week 1-2): Core Infrastructure
5. ✓ Playwright configuration
6. ✓ Authentication utilities
7. ✓ Base page and API client

### Phase 3 (Week 2-3): Page Objects & API Clients
8. ✓ Schema management pages
9. ✓ Context & ingestion pages
10. ✓ MCP pages
11. ✓ All API clients

### Phase 4 (Week 3-4): Test Fixtures & Hooks
12. ✓ Test fixtures
13. ✓ Global setup/teardown

### Phase 5 (Week 4-6): Test Suites
14. ✓ UI test suites
15. ✓ API test suites

### Phase 6 (Week 6): Polish & Documentation
16. ✓ Utilities and helpers
17. ✓ Test data files
18. ✓ Documentation
19. ✓ CI/CD setup

---

## Success Criteria

- [x] All 24 todo items completed ✅
- [x] 100% TypeScript strict mode compliance ✅
- [x] No ESLint errors ✅
- [x] All tests passing in test environment ✅
- [x] Allure reports generating successfully ✅
- [x] Authentication working with storageState ✅
- [x] Both UI and API tests independently runnable ✅
- [x] All tags working correctly ✅
- [x] Environment switching functional ✅
- [x] CI/CD pipeline operational ✅
- [x] Documentation complete and accurate ✅

## 📊 Implementation Status: COMPLETE

**Completion Date:** June 2026
**Framework Version:** 1.0.0
**Status:** ✅ Production Ready

### Summary

All phases of the Context Studio Automation Framework have been successfully implemented and are operational. The framework is now production-ready with:

- ✅ Complete test coverage across Schema, Context, and MCP modules
- ✅ Robust authentication with IBM W3 SSO
- ✅ Comprehensive documentation suite
- ✅ CI/CD pipelines for sanity and regression testing
- ✅ Allure reporting with rich test artifacts
- ✅ Multi-environment support (test, stage, prod)
- ✅ Slack & Teams notification integration

### Recent Enhancements (June 2026)

1. **Documentation Overhaul**
   - Added [CONTRIBUTING.md](CONTRIBUTING.md) - Comprehensive contribution guidelines
   - Added [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Detailed troubleshooting guide
   - Added [QUICK_START.md](QUICK_START.md) - 5-minute quick start guide
   - Added [docs/VIDEO_TUTORIALS.md](docs/VIDEO_TUTORIALS.md) - Video tutorial library
   - Updated [README.md](README.md) with table of contents and cross-references
   - Updated [ARCHITECTURE.md](ARCHITECTURE.md) with cross-references

2. **Framework Improvements**
   - Enhanced MCP output formatting
   - Improved authentication reliability
   - Optimized wait strategies
   - Added comprehensive error handling

### Next Steps

1. **Continuous Improvement**
   - Monitor test execution metrics
   - Gather user feedback
   - Identify optimization opportunities
   - Add new test scenarios as features evolve

2. **Video Content Creation**
   - Record tutorial videos per [docs/VIDEO_TUTORIALS.md](docs/VIDEO_TUTORIALS.md)
   - Create demo videos for new features
   - Build training materials for new team members

3. **Performance Optimization**
   - Analyze test execution times
   - Optimize parallel execution
   - Reduce flaky tests
   - Improve CI/CD pipeline efficiency

4. **Feature Additions**
   - Visual regression testing
   - Performance benchmarking
   - Load testing capabilities
   - Advanced reporting dashboards

### Maintenance

**Regular Tasks:**
- Weekly: Review and update test data
- Monthly: Update dependencies
- Quarterly: Review and update documentation
- As needed: Add new test scenarios

**Contact:**
- Team Lead: [IBM Internal Channels]
- Slack: #context-studio-automation
- GitHub Issues: For bugs and feature requests

---

**Framework Status:** 🟢 Operational
**Last Updated:** June 2026
**Made with Bob** 🤖