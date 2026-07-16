# Troubleshooting Guide

This guide helps you resolve common issues when working with the Context Studio Automation Framework.

## 📋 Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Installation Issues](#installation-issues)
- [Authentication Problems](#authentication-problems)
- [Test Execution Issues](#test-execution-issues)
- [Environment Configuration](#environment-configuration)
- [Ingestion & Async Operations](#ingestion--async-operations)
- [Reporting Issues](#reporting-issues)
- [CI/CD Problems](#cicd-problems)
- [Performance Issues](#performance-issues)
- [Getting Help](#getting-help)

## Quick Diagnostics

Run these commands to quickly identify common issues:

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check Playwright installation
npx playwright --version

# Check Java version (for Allure)
java --version

# Verify environment file exists
ls -la config/environments/

# Check auth state
ls -la ./auth/

# Run health check
npm run test:sanity -- --grep "@sanity" --max-failures=1
```

## Installation Issues

### Problem: `npm ci` fails

**Symptoms:**
```
npm ERR! code ENOLOCK
npm ERR! audit This command requires an existing lockfile.
```

**Solution:**
```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# Generate new lock file
npm ci
```

### Problem: Playwright browsers not installing

**Symptoms:**
```
Error: browserType.launch: Executable doesn't exist
```

**Solution:**
```bash
# Install Playwright browsers
npx playwright install

# Install system dependencies (Linux)
npx playwright install-deps

# Install specific browser
npx playwright install chromium
```

### Problem: TypeScript compilation errors

**Symptoms:**
```
error TS2307: Cannot find module '@pages/...'
```

**Solution:**
```bash
# Clean TypeScript cache
rm -rf node_modules/.cache

# Rebuild
npm run build

# Check tsconfig.json paths are correct
cat tsconfig.json | grep paths
```

### Problem: Allure CLI not found

**Symptoms:**
```
allure: command not found
```

**Solution:**
```bash
# Install Allure globally
npm install -g allure-commandline

# Verify installation
allure --version

# Alternative: Use npx
npx allure generate allure-results
```

## Authentication Problems

### Problem: SSO Login Fails

**Symptoms:**
```
Error: Login failed: Still on SSO page
TimeoutError: Timeout waiting for redirect
```

**Solutions:**

1. **Check Credentials**
   ```bash
   # Verify credentials in environment file
   cat config/environments/test.env | grep AUTH
   ```

2. **Clear Auth State**
   ```bash
   # Remove old auth files
   rm -rf ./auth/*.json
   
   # Re-authenticate
   npx ts-node hooks/global-setup.ts
   ```

3. **Check Network Access**
   - Ensure you're on IBM W3 intranet or VPN
   - Test SSO page manually in browser
   - Check firewall/proxy settings

4. **Increase Timeouts**
   ```typescript
   // In config/env-loader.ts or .env file
   DEFAULT_TIMEOUT=90000  # Increase to 90 seconds
   ```

### Problem: Auth State Expired Mid-Run

**Symptoms:**
```
Error: 401 Unauthorized
Session expired
```

**Solution:**
```bash
# The framework auto-refreshes, but if it fails:
rm ./auth/*.json
npx ts-node hooks/global-setup.ts

# Then re-run tests
npm run test:ui
```

### Problem: MFA/2FA Required

**Symptoms:**
```
Error: Login requires additional verification (MFA)
```

**Solution:**
- MFA is not currently supported in automation
- Contact your admin to disable MFA for test accounts
- Use a dedicated test account without MFA
- Consider using API tokens instead

### Problem: "Context Studio text not found"

**Symptoms:**
```
Error: Context Studio text not found after login
```

**Solutions:**

1. **Check Environment URL**
   ```bash
   # Verify BASE_URL is correct
   cat config/environments/test.env | grep BASE_URL
   ```

2. **Check User Permissions**
   - Ensure user has access to Context Studio
   - Verify user is in correct IBM groups
   - Test manual login in browser

3. **Increase Wait Time**
   ```typescript
   // In auth-helper.ts, increase timeout
   await page.waitForLoadState('networkidle', { timeout: 60000 });
   ```

## Test Execution Issues

### Problem: Tests Timing Out

**Symptoms:**
```
Test timeout of 30000ms exceeded
```

**Solutions:**

1. **Increase Global Timeout**
   ```typescript
   // In playwright.config.ts
   timeout: 120000,  // 2 minutes
   ```

2. **Increase Specific Action Timeout**
   ```typescript
   await element.click({ timeout: 60000 });
   await expect(element).toBeVisible({ timeout: 30000 });
   ```

3. **Check Network Speed**
   ```bash
   # Test network latency
   ping context-studio.test.ibm.com
   ```

### Problem: Flaky Tests

**Symptoms:**
- Tests pass sometimes, fail other times
- Intermittent failures
- "Element not found" errors

**Solutions:**

1. **Use Proper Waits**
   ```typescript
   // ❌ Bad
   await page.waitForTimeout(5000);
   
   // ✅ Good
   await expect(element).toBeVisible();
   await page.waitForLoadState('networkidle');
   ```

2. **Add Retry Logic**
   ```typescript
   // In playwright.config.ts
   retries: 2,  // Retry failed tests twice
   ```

3. **Check for Race Conditions**
   - Ensure proper test isolation
   - Avoid dependencies between tests
   - Use unique test data

### Problem: "Element is not attached to the DOM"

**Symptoms:**
```
Error: Element is not attached to the DOM
```

**Solutions:**

1. **Wait for Element Stability**
   ```typescript
   await element.waitFor({ state: 'attached' });
   await element.waitFor({ state: 'visible' });
   ```

2. **Re-query Element**
   ```typescript
   // Don't store locators, query fresh
   const button = page.locator('[data-testid="button"]');
   await button.click();
   ```

3. **Check for Dynamic Content**
   - Element might be re-rendered
   - Use more stable selectors
   - Wait for animations to complete

### Problem: Screenshot/Video Not Captured

**Symptoms:**
- No screenshots in Allure report
- Videos missing for failed tests

**Solutions:**

1. **Check Playwright Config**
   ```typescript
   // In playwright.config.ts
   use: {
     screenshot: 'only-on-failure',
     video: 'retain-on-failure',
   }
   ```

2. **Verify Output Directory**
   ```bash
   ls -la reports/
   ls -la test-results/
   ```

3. **Check Disk Space**
   ```bash
   df -h
   ```

## Environment Configuration

### Problem: Environment File Not Found

**Symptoms:**
```
Error: Environment file not found: config/environments/test.env
```

**Solution:**
```bash
# Copy example file
cp config/environments/example.env config/environments/test.env

# Edit with your credentials
nano config/environments/test.env
```

### Problem: Invalid Environment Variable

**Symptoms:**
```
Error: Required environment variable AUTH_USERNAME is not set
Error: Invalid BASE_URL: undefined
```

**Solutions:**

1. **Check File Format**
   ```bash
   # Ensure no spaces around =
   # ❌ Bad
   AUTH_USERNAME = user@ibm.com
   
   # ✅ Good
   AUTH_USERNAME=user@ibm.com
   ```

2. **Check for Quotes**
   ```bash
   # Remove quotes if present
   AUTH_PASSWORD=mypassword  # Not "mypassword"
   ```

3. **Verify File is Loaded**
   ```typescript
   // Add debug logging
   console.log('Loaded config:', envConfig);
   ```

### Problem: Wrong Environment Selected

**Symptoms:**
- Tests run against wrong environment
- Unexpected data or behavior

**Solution:**
```bash
# Explicitly set environment
TEST_ENV=stage npm run test:ui

# Or use testEnv parameter
testEnv=prod npm run test:sanity

# Check which environment is active
echo $TEST_ENV
```

## Ingestion & Async Operations

### Problem: Ingestion Timeout

**Symptoms:**
```
Error: Timeout waiting for ingestion completion
Elapsed: 300000ms, Last status: in_progress
```

**Solutions:**

1. **Increase Timeout**
   ```bash
   # In .env file
   INGESTION_POLL_TIMEOUT=600000  # 10 minutes
   INGESTION_POLL_INTERVAL=10000  # 10 seconds
   ```

2. **Check Ingestion Status Manually**
   - Log into Context Studio UI
   - Check Sources & Data tab
   - Verify ingestion is actually running

3. **Check File Size**
   - Large files take longer
   - Consider splitting large files
   - Check file format is supported

### Problem: Ingestion Fails

**Symptoms:**
```
Error: Ingestion failed with status: failed
Error message: Invalid file format
```

**Solutions:**

1. **Check File Format**
   - Supported: PDF, DOCX, CSV, JSON, YAML, TXT, HTML, MD, PPT, XLSX
   - Verify file is not corrupted
   - Check file encoding (UTF-8 recommended)

2. **Check File Size Limits**
   - Maximum file size: 50MB
   - Split larger files if needed

3. **Verify Schema Compatibility**
   - If using schema, ensure file matches schema structure
   - Check schema is published
   - Verify schema validation rules

### Problem: Manual Upload Not Working

**Symptoms:**
```
Error: File input not found
Error: Upload button not clickable
```

**Solutions:**

1. **Check File Path**
   ```typescript
   // Use absolute path
   const filePath = path.resolve(process.cwd(), 'test-data/file.pdf');
   ```

2. **Verify File Exists**
   ```bash
   ls -la test-data-files/
   ```

3. **Check File Permissions**
   ```bash
   chmod 644 test-data-files/file.pdf
   ```

## Reporting Issues

### Problem: Allure Report Empty

**Symptoms:**
- No tests shown in Allure report
- "No data available" message

**Solutions:**

1. **Check Results Directory**
   ```bash
   ls -la reports/allure-results/
   
   # Should contain .json files
   ```

2. **Verify Tests Ran**
   ```bash
   # Check test output
   npm run test:ui 2>&1 | tee test-output.log
   ```

3. **Regenerate Report**
   ```bash
   # Clean old reports
   npm run report:clean
   
   # Run tests
   npm run test:sanity
   
   # Generate report
   npm run report:generate
   ```

### Problem: Allure Report Won't Open

**Symptoms:**
```
Error: EADDRINUSE: address already in use
```

**Solution:**
```bash
# Kill existing Allure server
pkill -f allure

# Or use different port
allure open allure-report --port 8080
```

### Problem: Screenshots Not in Report

**Symptoms:**
- Allure report shows test failures
- No screenshots attached

**Solutions:**

1. **Check Screenshot Config**
   ```typescript
   // In test file
   test.afterEach(async ({ page }, testInfo) => {
     if (testInfo.status !== testInfo.expectedStatus) {
       const screenshot = await page.screenshot({ fullPage: true });
       await allure.attachment('Failure Screenshot', screenshot, 'image/png');
     }
   });
   ```

2. **Verify Allure Integration**
   ```typescript
   // In playwright.config.ts
   reporter: [['allure-playwright']],
   ```

## CI/CD Problems

### Problem: CI Pipeline Fails on Authentication

**Symptoms:**
```
Error: Storage state file not found
Error: Authentication failed in CI
```

**Solutions:**

1. **Check GitHub Secrets**
   - Verify `AUTH_USERNAME` is set
   - Verify `AUTH_PASSWORD` is set
   - Check secrets are not expired

2. **Check Setup Project**
   ```yaml
   # In .github/workflows/test.yml
   - name: Run tests
     run: npx playwright test
     # Setup project runs automatically
   ```

3. **Enable Debug Logging**
   ```yaml
   - name: Run tests
     run: DEBUG=pw:api npx playwright test
   ```

### Problem: Secret Scan Failing

**Symptoms:**
```
Error: Potential secrets detected
```

**Solutions:**

1. **Review Findings**
   ```bash
   detect-secrets scan --baseline .secrets.baseline
   ```

2. **Update Baseline for False Positives**
   ```bash
   detect-secrets scan > .secrets.baseline
   git add .secrets.baseline
   git commit -m "chore: update secrets baseline"
   ```

3. **Remove Actual Secrets**
   - Never commit credentials
   - Use environment variables
   - Check `.gitignore` includes `.env` files

### Problem: Artifacts Not Uploaded

**Symptoms:**
- No Allure report in GitHub Actions
- Test results missing

**Solutions:**

1. **Check Workflow File**
   ```yaml
   - name: Upload Allure Report
     uses: actions/upload-artifact@v3
     if: always()
     with:
       name: allure-report
       path: reports/allure-report/
   ```

2. **Verify Report Generation**
   ```yaml
   - name: Generate Allure Report
     run: npm run report:generate
   ```

## Performance Issues

### Problem: Tests Running Slowly

**Symptoms:**
- Tests take much longer than expected
- Timeouts occurring frequently

**Solutions:**

1. **Check Worker Configuration**
   ```typescript
   // In playwright.config.ts
   workers: 4,  // Adjust based on environment
   ```

2. **Optimize Waits**
   ```typescript
   // Use specific waits instead of generic ones
   await page.waitForLoadState('domcontentloaded');  // Faster
   // vs
   await page.waitForLoadState('networkidle');  // Slower
   ```

3. **Reduce Parallel Execution**
   ```bash
   # Run tests serially for debugging
   npx playwright test --workers=1
   ```

### Problem: High Memory Usage

**Symptoms:**
```
Error: JavaScript heap out of memory
```

**Solutions:**

1. **Increase Node Memory**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run test:ui
   ```

2. **Close Unused Contexts**
   ```typescript
   // In tests
   await context.close();
   await browser.close();
   ```

3. **Reduce Parallel Workers**
   ```typescript
   // In playwright.config.ts
   workers: 2,  // Reduce from 4
   ```

## Getting Help

### Before Asking for Help

1. **Check This Guide** - Review relevant sections above
2. **Check Documentation** - See [README.md](README.md) and [ARCHITECTURE.md](ARCHITECTURE.md)
3. **Search Issues** - Check GitHub Issues for similar problems
4. **Enable Debug Logging** - Collect detailed logs

### Debug Logging

```bash
# Enable Playwright debug logs
DEBUG=pw:api npx playwright test

# Enable framework debug logs
LOG_LEVEL=debug npm run test:ui

# Save logs to file
npm run test:ui 2>&1 | tee debug.log
```

### Collecting Information

When reporting an issue, include:

1. **Environment Details**
   ```bash
   node --version
   npm --version
   npx playwright --version
   echo $TEST_ENV
   ```

2. **Error Message**
   - Full error stack trace
   - Screenshot if applicable
   - Test name and file

3. **Steps to Reproduce**
   - Exact commands run
   - Configuration used
   - Expected vs actual behavior

4. **Logs**
   - Test output
   - Debug logs
   - Browser console logs

### Where to Get Help

1. **Slack Channel**: #context-studio-automation
2. **GitHub Issues**: Create a new issue with template
3. **Team Lead**: Contact via IBM internal channels
4. **Documentation**: 
   - [README.md](README.md)
   - [ARCHITECTURE.md](ARCHITECTURE.md)
   - [CONTRIBUTING.md](CONTRIBUTING.md)
   - [Video Tutorials](docs/VIDEO_TUTORIALS.md)

### Creating a Good Issue Report

```markdown
## Description
Brief description of the problem

## Environment
- OS: macOS/Linux/Windows
- Node version: 18.x
- Playwright version: 1.40.x
- Test environment: test/stage/prod

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Error Message
```
Paste error message here
```

## Logs
```
Paste relevant logs here
```

## Screenshots
Attach screenshots if applicable
```

---

**Still stuck?** Don't hesitate to reach out on Slack or create a GitHub issue. We're here to help!

**Made with Bob** 🤖