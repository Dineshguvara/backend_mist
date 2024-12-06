module.exports = {
  // Set the root directory for Jest to the project root, not the 'src' directory
  rootDir: './',

  // Update moduleNameMapper to resolve paths from the root of the project
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1', // This is correct if your 'src' folder is in the root of your project
  },

  // Ensure Jest can handle both .ts and .js files
  moduleFileExtensions: ['js', 'json', 'ts'],

  // Set up the test regex to match all files with .spec.ts extension
  testRegex: '.*\\.spec\\.ts$',

  // Use ts-jest to transform TypeScript files
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },

  // Collect coverage for all .ts and .js files
  collectCoverageFrom: ['**/*.(t|j)s'],

  // Set coverage output directory
  coverageDirectory: '../coverage',

  // Use Node environment for testing
  testEnvironment: 'node',
};
