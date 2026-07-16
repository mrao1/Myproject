# Context Studio — Test Automation Framework

> 🚀 **Quick Start**: New to the framework? Check out the [Quick Start Guide](QUICK_START.md) for a visual walkthrough!

## 📚 Table of Contents

- [Overview](#overview)
- [Documentation](#documentation)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Authentication Setup](#authentication-setup)
- [Running Tests](#running-tests)
- [Tag Reference](#tag-reference)
- [Allure Reporting](#allure-reporting)
- [Slack & Teams Notifications](#slack--teams-notifications)
- [CI/CD](#cicd)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

This is a production-grade test automation framework for **Context Studio**, an IBM enterprise platform that manages AI agent context via three core modules:

1. **Schema Management** — Create, edit, and publish schemas (JSON-LD, CSV, manual) with Nodes, Edges, Actions, and Constraints
2. **Context & Ingestion** — Create contexts, upload files, connect GitHub/SharePoint sources, and monitor async ingestion status
3. **MCP Exposure** — Expose context via MCP tools (Get Contexts, Get Metadata, Graph Query, Vector Query, Hybrid Query, Post Event)

The framework provides:
- **UI Automation** — Playwright with Page Object Model (POM)
- **API Automation** — Playwright APIRequestContext for REST API testing
- **Two independently runnable test suites** — UI and API tests can run separately or together
- **Allure Reporting** — Rich HTML reports with screenshots, traces, and API response bodies
- **Slack & Teams Notifications** — Automatic notifications on test completion
- **CI/CD Integration** — GitHub Actions workflows for sanity and regression runs

## 📚 Documentation

Comprehensive guides to help you get started and master the framework:

### Core Documentation
- **[Quick Start Guide](QUICK_START.md)** - Visual walkthrough for new users (⏱️ 5 min read)
- **[Architecture Overview](ARCHITECTURE.md)** - Framework design, patterns, and structure
- **[Implementation Plan](IMPLEMENTATION_PLAN.md)** - Development roadmap and completion status
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the framework
- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Common issues and solutions

### Specialized Guides
- **[Authentication Patterns](docs/AUTHENTICATION_COMPARISON.md)** - SSO authentication deep-dive
- **[MCP Output Formatting](docs/MCP_OUTPUT_FORMATTING.md)** - MCP tool output formatting guide
- **[Authentication Setup](docs/AUTHENTICATION_SETUP.md)** - Detailed auth configuration
- **[Video Tutorials](docs/VIDEO_TUTORIALS.md)** - Step-by-step video guides

### Reference
- **[API Endpoints](src/constants/api-endpoints.ts)** - All API endpoint definitions
- **[UI Selectors](src/constants/selectors.ts)** - Centralized UI selectors
- **[Test Data](src/constants/test-data.ts)** - Test data constants and enums

## Prerequisites

- **Node.js 18+**
- **Java 11+** (required for Allure CLI)
- **Allure CLI** — Install globally: `npm install -g allure-commandline`
- **IBM W3 intranet access** — Required for SSO authentication
- **Access to Context Studio environments** — test, stage, and/or prod

## Installation

```bash
git clone <repository-url>
cd context-studio-automation
npm ci
npx playwright install chromium
```

## Environment Setup

The framework uses environment-specific configuration files located in `config/environments/`.

### Configuration Files

Create the following files based on `config/environments/example.env`:

- `config/environments/test.env` — Test environment configuration
- `config/environments/stage.env` — stage environment configuration
- `config/environments/prod.env` — Production environment configuration

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `BASE_URL` | Yes | Context Studio UI base URL | `https://context-studio.test.ibm.com` |
| `API_BASE_URL` | Yes | Context Studio API base URL | `https://api.context-studio.test.ibm.com` |
| `AUTH_USERNAME` | Yes | IBM W3 SSO username | `your-w3-id@ibm.com` |
| `AUTH_PASSWORD` | Yes | IBM W3 SSO password | `your-password` |
| `DEFAULT_TIMEOUT` | Yes | Playwright action timeout (ms) | `60000` |
| `INGESTION_POLL_TIMEOUT` | Yes | Max wait for ingestion (ms) | `300000` |
| `INGESTION_POLL_INTERVAL` | Yes | Ingestion status poll interval (ms) | `5000` |
| `GITHUB_TEST_PAT` | Yes | GitHub Personal Access Token | `ghp_xxxxxxxxxxxx` |
| `SHAREPOINT_TEST_URL` | Yes | SharePoint site URL for tests | `https://ibm.sharepoint.com/sites/TestSite` |
| `SLACK_WEBHOOK_URL` | No | Slack incoming webhook URL | `https://hooks.slack.com/services/XXX/YYY/ZZZ` |
| `TEAMS_WEBHOOK_URL` | No | Teams incoming webhook URL | `https://your-org.webhook.office.com/webhookb2/...` |
| `LOG_LEVEL` | Yes | Winston log level | `info` (options: error, warn, info, debug) |

### Passing Environment at Runtime

You can override the environment using the `testEnv` parameter:

```bash
testEnv=stage npm run test:ui
testEnv=prod npm run test:sanity
```

Default environment is `test` if not specified.

## Authentication Setup

The framework uses Playwright's `storageState` to persist IBM W3 SSO sessions across test runs.

### How It Works

1. **Global Setup** (`hooks/global-setup.ts`) performs IBM W3 SSO login
2. Session cookies are saved to `./auth/{env}.json`
3. All tests reuse this session file (valid for 8 hours)
4. API tests extract the Bearer token from the same `storageState`

### Generating Auth State

To generate authentication state for an environment:

```bash
npx ts-node hooks/global-setup.ts
```

The auth file will be created at `./auth/{env}.json` where `{env}` is determined by the `TEST_ENV` environment variable (default: `test`).

### Auth File Location

- `./auth/test.json` — Test environment session
- `./auth/stage.json` — stage environment session
- `./auth/prod.json` — Production environment session

**Important:** These files contain live session tokens. Never commit them to version control (they are gitignored).

### Session Reuse Window

- Auth files are valid for **8 hours** from creation
- The framework automatically checks expiration before each run
- If expired, `global-setup.ts` re-authenticates automatically

### Force Refresh

To force a new authentication session:

```bash
rm ./auth/{env}.json
npx ts-node hooks/global-setup.ts
```

## Running Tests

### NPM Scripts

| Command | Description | Example |
|---------|-------------|---------|
| `npm run test:ui` | Run all UI tests | `npm run test:ui` |
| `npm run test:api` | Run all API tests | `npm run test:api` |
| `npm run test:all` | Run both UI and API tests | `npm run test:all` |
| `npm run test:sanity` | Run sanity tests (UI + API) | `npm run test:sanity` |
| `npm run test:regression` | Run regression tests (UI + API) | `npm run test:regression` |
| `npm run test:tag` | Run tests by tag | `npm run test:tag -- --grep @schema` |
| `npm run test:env` | Run tests on specific environment | `testEnv=stage npm run test:env` |
| `npm run report:generate` | Generate Allure report | `npm run report:generate` |
| `npm run report:open` | Open Allure report in browser | `npm run report:open` |
| `npm run report:clean` | Clean old Allure results | `npm run report:clean` |

### Additional Examples

**Run UI sanity tests on stage:**
```bash
testEnv=stage npm run test:sanity -- --project=ui
```

**Run only @context tagged tests:**
```bash
npm run test:tag -- --grep @context
```

**Run a single spec file:**
```bash
npx playwright test tests/ui/schema/schema-crud.spec.ts
```

**Run tests with specific tag combination:**
```bash
npx playwright test --grep "@sanity.*@schema"
```

**Run tests in headed mode (see browser):**
```bash
npx playwright test --headed
```

**Run tests in debug mode:**
```bash
npx playwright test --debug
```

## Tag Reference

| Tag | Scope | When to Use |
|-----|-------|-------------|
| `@sanity` | All environments | Core happy path tests, run on every deploy |
| `@regression` | Test environment only | Full test suite, scheduled weekly |
| `@prodsanity` | Production | Read-only tests safe for production |
| `@stagsanity` | stage | stage-specific flows |
| `@ui` | UI tests | All browser-based tests |
| `@api` | API tests | All API-layer tests |
| `@schema` | Schema module | Schema CRUD and publish flows |
| `@context` | Context module | Context creation and ingestion |
| `@mcp` | MCP module | MCP exposure and tool queries |

### Tag Usage Examples

```bash
# Run all sanity tests
npm run test:sanity

# Run only UI regression tests
npm run test:regression -- --project=ui

# Run schema-related tests only
npx playwright test --grep @schema

# Run sanity tests excluding MCP
npx playwright test --grep "@sanity" --grep-invert "@mcp"
```

## Allure Reporting

### Generate and Open Report Locally

```bash
npm run report:generate
npm run report:open
```

### What's Captured

- **Allure Steps** — Detailed step-by-step execution via `step()` wrapper
- **Screenshots** — Automatic screenshots on test failure
- **API Response Bodies** — Full request/response payloads via `attachApiResponse()`
- **Playwright Traces** — Video recordings and DOM snapshots on failure
- **Test Metadata** — Feature, story, severity, tags, duration

### Clean Old Results

```bash
npm run report:clean
```

This removes `reports/allure-results/` and `reports/allure-report/` directories.

## Slack & Teams Notifications

### How It Works

The `NotificationReporter` automatically sends test result summaries to Slack and Teams after every test run.

**Notification Behavior:**
- **Sanity runs** — Always notify (pass or fail)
- **Regression runs** — Notify on failure only
- **Both channels are optional** — Missing webhook URL = silent skip (no error thrown)

### Configure Locally

Add the following to your `.env` file:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX/YYY/ZZZ
TEAMS_WEBHOOK_URL=https://your-org.webhook.office.com/webhookb2/...
```

### Get a Slack Webhook URL

1. Go to your Slack workspace
2. Navigate to **Your Apps** → **Incoming Webhooks**
3. Click **Add New Webhook to Workspace**
4. Select the channel to post to
5. Copy the webhook URL

### Get a Teams Webhook URL

1. Open the Teams channel where you want notifications
2. Click **⋯** (More options) → **Manage channel**
3. Go to **Connectors** tab
4. Find **Incoming Webhook** → Click **Configure**
5. Provide a name and upload an icon (optional)
6. Copy the webhook URL

### Notification Content

Each notification includes:
- **Status** — PASSED / FAILED / PARTIAL (some tests failed)
- **Environment** — test / stage / prod
- **Test Type** — UI / API / ALL
- **Test Counts** — Total, passed, failed, skipped
- **Duration** — Total run time in minutes and seconds
- **Failed Test Names** — List of failed tests (max 10, then "+ N more")
- **Triggered By** — CI (GitHub Actions) or Local
- **Allure Report URL** — Link to artifact (if running in CI)
- **Timestamp** — IST timezone

## CI/CD

### Sanity Pipeline

**File:** `.github/workflows/sanity.yml`

**Triggers:**
- **Manual** — `workflow_dispatch` with environment selection (test/stage/prod)
- **Scheduled** — Monday–Friday at 9:00 AM IST (3:30 AM UTC)

**What It Does:**
1. Runs `@sanity` tests on the selected environment
2. Generates Allure report
3. Uploads test results and report as artifacts (14-day retention)
4. Sends Slack + Teams notifications (always, pass or fail)

**How to Trigger Manually:**
1. Go to **Actions** tab in GitHub
2. Select **Context Studio — Sanity** workflow
3. Click **Run workflow**
4. Select target environment
5. Click **Run workflow** button

### Regression Pipeline

**File:** `.github/workflows/regression.yml`

**Triggers:**
- **Manual** — `workflow_dispatch` (test environment only, requires confirmation)
- **Scheduled** — Sunday at 11:00 PM IST (5:30 PM UTC)

**What It Does:**
1. Runs `@regression` tests on test environment only
2. Generates Allure report
3. Uploads test results and report as artifacts (30-day retention)
4. Sends Slack + Teams notifications (on failure only)

**How to Trigger Manually:**
1. Go to **Actions** tab in GitHub
2. Select **Context Studio — Regression** workflow
3. Click **Run workflow**
4. Type `test` in the confirmation field
5. Click **Run workflow** button

### Required GitHub Secrets

Configure these secrets in **Settings → Secrets and variables → Actions**:

| Secret Name | Description |
|-------------|-------------|
| `AUTH_USERNAME` | IBM W3 login username |
| `AUTH_PASSWORD` | IBM W3 login password |
| `GITHUB_TEST_PAT` | GitHub Personal Access Token for connector tests |
| `SHAREPOINT_TEST_URL` | SharePoint site URL for connector tests |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL (optional) |
| `TEAMS_WEBHOOK_URL` | Teams incoming webhook URL (optional) |

## Adding a New Page Object

1. **Create file** in the appropriate `pages/` subfolder extending `BasePage`:
   ```typescript
   import { Page } from '@playwright/test';
   import { BasePage } from '../base/BasePage';
   
   export class MyNewPage extends BasePage {
     constructor(page: Page) {
       super(page);
     }
     
     async navigate(): Promise<void> {
       await this.page.goto('/my-new-page');
       await this.waitForPageLoad();
     }
   }
   ```

2. **Add selectors** to `constants/selectors.ts`:
   ```typescript
   MY_NEW_PAGE: {
     BUTTON: '[data-testid="my-button"]',
     INPUT: '[data-testid="my-input"]',
   }
   ```

3. **Add fixture** to `fixtures/ui-fixtures.ts`:
   ```typescript
   myNewPage: async ({ page }, use) => {
     const myNewPage = new MyNewPage(page);
     await use(myNewPage);
   }
   ```

4. **Use in tests**:
   ```typescript
   test('my test', async ({ myNewPage }) => {
     await myNewPage.navigate();
   });
   ```

## Adding a New Test

1. **Create spec file** in the appropriate `tests/` subfolder

2. **Import from correct fixture**:
   ```typescript
   import { test, expect } from '../../../fixtures/ui-fixtures';
   // or
   import { test, expect } from '../../../fixtures/api-fixtures';
   ```

3. **Add Allure annotations**:
   ```typescript
   import { allure } from 'allure-playwright';
   
   test.beforeEach(async () => {
     allure.feature('Schema Management');
     allure.story('Schema CRUD');
   });
   
   test('my test', async ({ schemaListPage }) => {
     allure.severity('critical');
     // test code
   });
   ```

4. **Add relevant tags**:
   ```typescript
   test('my test', { tag: ['@sanity', '@ui', '@schema'] }, async ({ schemaListPage }) => {
     // test code
   });
   ```

5. **Wrap actions in step()**:
   ```typescript
   import { step } from '../../../utils/allure-helper';
   
   await step('Navigate to schema list', async () => {
     await schemaListPage.navigate();
   });
   ```

## Troubleshooting

For detailed troubleshooting steps, see the **[Troubleshooting Guide](TROUBLESHOOTING.md)**.

### Quick Fixes

#### Ingestion Timeout

If ingestion tests are timing out, increase the timeout in your `.env` file:

```bash
INGESTION_POLL_TIMEOUT=600000  # 10 minutes
```

#### SSO Login Failure

If authentication fails:

```bash
rm ./auth/*.json
npx ts-node hooks/global-setup.ts
```

### storageState Expired Mid-Run

The `refreshIfExpired()` function in `utils/auth-helper.ts` handles this automatically. If the issue persists:

```bash
npx ts-node hooks/global-setup.ts
```

### API 401 Errors

Auth token expired. Regenerate the storageState:

```bash
rm ./auth/{env}.json
npx ts-node hooks/global-setup.ts
```

### Allure Report Empty

Verify that `reports/allure-results/` is not empty before running `report:generate`:

```bash
ls -la reports/allure-results/
```

If empty, tests may not have run or results were cleaned. Re-run tests first.

### Slack/Teams Not Receiving Notifications

1. Verify webhook URLs are set in your `.env` file
2. Check `utils/notification-helper.ts` logs for "skipped" warnings
3. Test webhook URLs manually using curl:

```bash
curl -X POST -H 'Content-Type: application/json' \
  -d '{"text":"Test message"}' \
  YOUR_WEBHOOK_URL
```

### Secret Scan Failing on CI

Run `detect-secrets` locally to review findings:

```bash
pip install detect-secrets
detect-secrets scan --baseline .secrets.baseline
```

If it's a false positive, update the baseline:

```bash
detect-secrets scan > .secrets.baseline
git add .secrets.baseline
git commit -m "chore: update secrets baseline"
```

### Bob IDE Context Lost

If Bob loses context between sessions, re-send **Prompt 0** (the framework context prompt) before any code generation request.

## Security

See [`docs/SECURITY.md`](docs/SECURITY.md) for comprehensive security guidelines covering:

- Credential handling and `.env` hygiene
- Auth file security (never commit `./auth/*.json`)
- What to do if a secret is accidentally committed
- How to update the `detect-secrets` baseline
- Incident response procedures

## Contributing

We welcome contributions! Please read our **[Contributing Guide](CONTRIBUTING.md)** for:

- Code review process
- Branch naming conventions
- Commit message standards
- Pull request guidelines
- Testing requirements

**Quick Contribution Steps:**
1. Create a feature branch from `main`
2. Make your changes following the existing patterns
3. Add tests for new functionality
4. Run `npm run test:sanity` locally
5. Ensure secret scan passes: `detect-secrets scan --baseline .secrets.baseline`
6. Submit a pull request

## License

Internal IBM project. All rights reserved.

## Contact

For questions or support:
- **Team Lead:** [Contact via IBM internal channels]
- **Slack Channel:** #context-studio-automation
- **Wiki:** [Internal IBM Wiki Link]
- **Issues:** Use GitHub Issues for bug reports and feature requests

## Additional Resources

- 🏗️ **[Architecture Diagrams](ARCHITECTURE.md)** - Visual framework overview
- 📋 **[Implementation Status](IMPLEMENTATION_PLAN.md)** - Development progress
- 🔐 **[Authentication Deep-Dive](docs/AUTHENTICATION_COMPARISON.md)** - Auth patterns explained

---

**Made with Bob** 🤖