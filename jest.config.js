export default {
  testEnvironment: 'jsdom',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/backend/tests/**/*.test.js'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'public/js/**/*.js',
    '!public/js/vendor/**/*.js'
  ],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  }
};