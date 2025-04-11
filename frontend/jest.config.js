export default {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/main.jsx', '!src/vite-env.d.ts'], // Adjust as needed
  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  // Needed for static assets if not handled by transformer
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS Modules
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js' // Mock static assets
  },
   // Support for ES Modules - might need Babel configuration if transform doesn't work out-of-the-box
   // If using Babel:
   // transform: {
   //   '^.+\\.(js|jsx)$': 'babel-jest',
   // },
   // moduleFileExtensions: ['js', 'jsx'],
   // transformIgnorePatterns: [ // Adjust if node_modules need transforming
   //   '/node_modules/(?!your-es-module-dependency).+\\.js$'
   // ],

   // Basic setup without explicit Babel transform first
   moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
};
