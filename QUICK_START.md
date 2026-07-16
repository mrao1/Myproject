# Quick Start Guide

Get up and running with the Context Studio Automation Framework in 5 minutes!

## 🎯 What You'll Learn

By the end of this guide, you'll be able to:
- ✅ Install and configure the framework
- ✅ Run your first test
- ✅ View test results in Allure
- ✅ Understand the project structure

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js 18+** installed ([Download](https://nodejs.org/))
- [ ] **Java 11+** installed ([Download](https://www.oracle.com/java/technologies/downloads/))
- [ ] **IBM W3 intranet access** (VPN if remote)
- [ ] **Context Studio credentials** (username & password)
- [ ] **Git** installed

**Quick Check:**
```bash
node --version  # Should show v18.x or higher
java --version  # Should show 11.x or higher
git --version   # Should show git version
```

## 🚀 Step 1: Clone & Install (2 minutes)

### 1.1 Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd context-studio-automation

# Verify you're in the right directory
ls -la
# You should see: package.json, playwright.config.ts, README.md
```

### 1.2 Install Dependencies

```bash
# Install Node.js dependencies
npm ci

# Install Playwright browsers
npx playwright install chromium

# Install Allure CLI globally
npm install -g allure-commandline

# Verify installations
npx playwright --version
allure --version
```

**Expected Output:**
```
✓ Playwright installed successfully
✓ Chromium browser installed
✓ Allure CLI ready
```

## ⚙️ Step 2: Configure Environment (1 minute)

### 2.1 Create Environment File

```bash
# Copy the example environment file
cp config/environments/example.env config/environments/test.env

# Open for editing
nano config/environments/test.env
# Or use your preferred editor: code, vim, etc.
```

### 2.2 Fill in Required Values

```bash
# Minimum required configuration
BASE_URL=https://context-studio.test.ibm.com
API_BASE_URL=https://api.context-studio.test.ibm.com
AUTH_USERNAME=your-w3-id@ibm.com
AUTH_PASSWORD=your-password
DEFAULT_TIMEOUT=60000
INGESTION_POLL_TIMEOUT=300000
INGESTION_POLL_INTERVAL=5000
GITHUB_TEST_PAT=ghp_your_token_here
SHAREPOINT_TEST_URL=https://ibm.sharepoint.com/sites/YourSite
LOG_LEVEL=info
```

**💡 Tip:** Get your GitHub PAT from [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)

### 2.3 Verify Configuration

```bash
# Check file was created
ls -la config/environments/test.env

# Verify no syntax errors
cat config/environments/test.env | grep BASE_URL
```

## 🔐 Step 3: Authenticate (1 minute)

### 3.1 Run Authentication Setup

```bash
# This will open a browser and log you in
npx ts-node hooks/global-setup.ts
```

**What Happens:**
1. Browser opens (you'll see it!)
2. Navigates to Context Studio
3. Fills in your credentials
4. Saves session to `./auth/test.json`
5. Browser closes

**Expected Output:**
```
✓ Loaded environment configuration: test
✓ Navigated to app
✓ Clicked IBMid Login button
✓ Filled username
✓ Clicked continue
✓ Filled password
✓ Clicked sign in
✓ Redirected away from SSO
✓ Authentication successful
✓ Storage state saved
```

### 3.2 Verify Authentication

```bash
# Check auth file was created
ls -la ./auth/test.json

# File should exist and be ~5-10KB
```

## 🧪 Step 4: Run Your First Test (30 seconds)

### 4.1 Run a Single Sanity Test

```bash
# Run one quick test to verify everything works
npx playwright test src/tests/ui/schema/schema-import-private-visibility.spec.ts --headed
```

**What You'll See:**
- Browser opens
- Test navigates to Context Studio
- Creates a schema
- Verifies it was created
- Browser closes

### 4.2 Run All Sanity Tests

```bash
# Run the full sanity suite (takes ~5-10 minutes)
npm run test:sanity
```

**Expected Output:**
```
Running 15 tests using 4 workers

  ✓ Schema Creation - Create JSON-LD Schema (12s)
  ✓ Context Creation - Create Team Context (8s)
  ✓ Manual Ingestion - Upload PDF (15s)
  ...

15 passed (2m 30s)
```

## 📊 Step 5: View Results (30 seconds)

### 5.1 Generate Allure Report

```bash
# Generate the report
npm run report:generate

# Open in browser
npm run report:open
```

**What You'll See:**
- Beautiful HTML report opens in browser
- Test execution timeline
- Pass/fail statistics
- Screenshots for failures
- Detailed test steps

### 5.2 Explore the Report

**Key Sections:**
- **Overview** - Summary statistics
- **Suites** - Tests organized by feature
- **Graphs** - Visual analytics
- **Timeline** - Execution timeline
- **Behaviors** - Tests by feature/story

**💡 Tip:** Click on any test to see:
- Detailed steps
- Screenshots
- Error messages
- Execution time

## 📁 Step 6: Understand Project Structure (1 minute)

```
context-studio-automation/
├── config/                    # Environment configurations
│   ├── environments/
│   │   ├── test.env          # Test environment config
│   │   ├── stage.env         # Stage environment config
│   │   └── prod.env          # Production environment config
│   └── env-loader.ts         # Configuration loader
│
├── src/
│   ├── pages/                # Page Object Model
│   │   ├── base/
│   │   │   └── BasePage.ts   # Base page class
│   │   ├── schema/           # Schema management pages
│   │   ├── context/          # Context & ingestion pages
│   │   └── mcp/              # MCP exposure pages
│   │
│   ├── api/                  # API clients
│   │   ├── base/
│   │   │   └── BaseApiClient.ts
│   │   ├── schema/
│   │   ├── context/
│   │   └── mcp/
│   │
│   ├── fixtures/             # Test fixtures
│   │   ├── ui-fixtures.ts    # UI test fixtures
│   │   ├── api-fixtures.ts   # API test fixtures
│   │   └── combined-fixtures.ts
│   │
│   ├── utils/                # Utility functions
│   │   ├── auth-helper.ts    # Authentication utilities
│   │   ├── wait-helpers.ts   # Wait strategies
│   │   └── mcp-helper.ts     # MCP utilities
│   │
│   ├── constants/            # Constants & test data
│   │   ├── selectors.ts      # UI selectors
│   │   ├── api-endpoints.ts  # API endpoints
│   │   └── test-data.ts      # Test data
│   │
│   └── tests/                # Test files
│       ├── auth.setup.ts     # Authentication setup
│       └── ui/               # UI tests
│           ├── schema/       # Schema tests
│           ├── context/      # Context tests
│           └── mcp/          # MCP tests
│
├── test-data-files/          # Test data files
│   ├── Ontologies/           # Schema files
│   └── manual-ingestions/    # Sample documents
│
├── auth/                     # Auth state (gitignored)
│   └── test.json            # Session cookies
│
├── reports/                  # Test reports
│   ├── allure-results/      # Raw results
│   └── allure-report/       # HTML report
│
├── docs/                     # Documentation
│   ├── AUTHENTICATION_COMPARISON.md
│   ├── MCP_OUTPUT_FORMATTING.md
│   └── VIDEO_TUTORIALS.md
│
├── README.md                 # Main documentation
├── ARCHITECTURE.md           # Framework architecture
├── CONTRIBUTING.md           # Contribution guide
├── TROUBLESHOOTING.md        # Troubleshooting guide
├── QUICK_START.md           # This file!
├── package.json             # Dependencies
├── playwright.config.ts     # Playwright configuration
└── tsconfig.json            # TypeScript configuration
```

## 🎓 Next Steps

Now that you're set up, here's what to explore next:

### Learn the Framework

1. **Read the Architecture** → [ARCHITECTURE.md](ARCHITECTURE.md)
   - Understand the framework design
   - Learn about patterns used
   - See execution flows

2. **Watch Video Tutorials** → [docs/VIDEO_TUTORIALS.md](docs/VIDEO_TUTORIALS.md)
   - Visual walkthroughs
   - Common workflows
   - Best practices

3. **Study Test Examples**
   - Schema tests: `src/tests/ui/schema/`
   - Context tests: `src/tests/ui/context/`
   - MCP tests: `src/tests/ui/mcp/`

### Run Different Test Types

```bash
# Run UI tests only
npm run test:ui

# Run API tests only
npm run test:api

# Run all tests
npm run test:all

# Run regression suite
npm run test:regression

# Run tests with specific tag
npx playwright test --grep @schema

# Run tests on different environment
testEnv=stage npm run test:sanity
```

### Write Your First Test

1. **Create a new test file**
   ```bash
   touch src/tests/ui/my-feature/my-test.spec.ts
   ```

2. **Use the template**
   ```typescript
   import { test, expect } from '../../../fixtures/ui-fixtures';
   import { allure } from 'allure-playwright';
   import { step } from '../../../utils/allure-helper';

   test.describe('My Feature @ui @myfeature', () => {
     test.beforeEach(async () => {
       allure.feature('My Module');
       allure.story('My Feature Story');
     });

     test('should do something @sanity', async ({ page }) => {
       allure.severity('critical');

       await step('Navigate to page', async () => {
         await page.goto('/my-page');
       });

       await step('Verify element', async () => {
         await expect(page.locator('#my-element')).toBeVisible();
       });
     });
   });
   ```

3. **Run your test**
   ```bash
   npx playwright test src/tests/ui/my-feature/my-test.spec.ts
   ```

### Contribute to the Framework

1. **Read Contributing Guide** → [CONTRIBUTING.md](CONTRIBUTING.md)
2. **Check open issues** on GitHub
3. **Create a feature branch**
4. **Submit a pull request**

## 🆘 Common Issues

### Issue: Authentication Fails

```bash
# Solution: Clear auth and retry
rm -rf ./auth/*.json
npx ts-node hooks/global-setup.ts
```

### Issue: Tests Timeout

```bash
# Solution: Increase timeout in .env
echo "DEFAULT_TIMEOUT=90000" >> config/environments/test.env
```

### Issue: Allure Report Empty

```bash
# Solution: Clean and regenerate
npm run report:clean
npm run test:sanity
npm run report:generate
npm run report:open
```

**More Issues?** → See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## 📚 Additional Resources

- **[README.md](README.md)** - Complete documentation
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Framework architecture
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues
- **[docs/VIDEO_TUTORIALS.md](docs/VIDEO_TUTORIALS.md)** - Video guides
- **[docs/AUTHENTICATION_COMPARISON.md](docs/AUTHENTICATION_COMPARISON.md)** - Auth patterns
- **[docs/MCP_OUTPUT_FORMATTING.md](docs/MCP_OUTPUT_FORMATTING.md)** - MCP formatting

## 💬 Get Help

- **Slack**: #context-studio-automation
- **GitHub Issues**: Create an issue with the bug/question template
- **Team Lead**: Contact via IBM internal channels

## 🎉 Congratulations!

You've successfully set up the Context Studio Automation Framework! 

**What you've accomplished:**
- ✅ Installed all dependencies
- ✅ Configured your environment
- ✅ Authenticated successfully
- ✅ Ran your first tests
- ✅ Generated Allure reports
- ✅ Understand the project structure

**You're now ready to:**
- Write new tests
- Run existing test suites
- Contribute to the framework
- Help others get started

---

**Made with Bob** 🤖