import { defineConfig, devices } from '@playwright/test';
import { envConfig } from './config/env-loader';

/**
 * Playwright Configuration for Context Studio Automation Framework
 *
 * Features:
 * - Setup project for authentication (runs before all tests)
 * - Two test projects: "ui" (browser-based) and "api" (API-only)
 * - Environment-based configuration (test/stage/prod)
 * - Dynamic worker allocation based on environment
 * - CI-aware retry logic
 * - Allure and list reporters
 * - Tag-based test filtering support
 */

// Use environment configuration singleton (loaded silently to avoid duplicate logs)
const testEnv = process.env.TEST_ENV || 'stage';


/**
 * Determine number of workers based on environment
 * - Production: 1 worker (serial execution for safety)
 * - stage: 2 workers (moderate parallelization)
 * - Test: 4 workers (maximum parallelization)
 */
const getWorkers = (): number => {
  switch (testEnv) {
    case 'prod':
      return 1;
    case 'stage':
      return 2;
    case 'test':
    default:
      return 4;
  }
};

export default defineConfig({
  // Test directory configuration
  testDir: './src/tests',

  // Output directory for test artifacts
  outputDir: './reports',

  // Enable full parallel execution
  fullyParallel: true,

  // Retry configuration: 2 retries on CI, 0 locally
  retries: process.env.CI ? 2 : 0,

  // Dynamic worker allocation based on environment
  workers: getWorkers(),

  // Global timeout: 10 minutes
  globalTimeout: 10 * 60 * 1000,

  // 
  timeout: 10 * 60 * 1000,

  // Reporter configuration
  reporter: [
    ['allure-playwright'],
    ['list']
  ],

  expect: {
    timeout: 15000,
  },
  // Global use configuration
  use: {
    // UI action timeout
    actionTimeout: 25000,

    // Page navigation timeout
    navigationTimeout: 30000,
    // Trace configuration for debugging
    trace: 'on-first-retry',
  },

  // Project configurations
  projects: [
    // Setup project - runs authentication before all tests
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: envConfig.baseUrl,
        // Run setup with visible browser for debugging
        headless: false,
        video: 'on',
        screenshot: 'on',
      },
    },

    // UI test project
    {
      name: 'ui',
      use: {
        // Use Chromium browser with desktop Chrome configuration
        ...devices['Desktop Chrome'],

        // Base URL from environment configuration
        baseURL: envConfig.baseUrl,

        // Authentication state per environment (created by setup project)
        storageState: `./auth/${testEnv}.json`,

        // Video recording: retain only on failure
        video: 'retain-on-failure',

        // Screenshot: capture only on failure
        screenshot: 'only-on-failure',

        // Trace: retain only on failure
        trace: 'retain-on-failure',
      },

      // Test file pattern (exclude setup files)
      testMatch: /.*\.spec\.ts$/,
      testIgnore: /.*\.setup\.ts$/,

      // Depends on setup project
      dependencies: ['setup'],
    },

  ],

  // Global setup hook - DISABLED: Now using setup project for authentication
  // globalSetup: './src/hooks/global-setup.ts',

  // Global teardown hook - DISABLED: Currently commented out
  // globalTeardown: './hooks/global-teardown.ts',
});

