module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/test/**/*.test.mjs"],
  globalSetup: "<rootDir>/test/build.cjs",
  coverageProvider: "v8",
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/dist/**/*.js"],
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text", "text-summary", "lcov"],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};
