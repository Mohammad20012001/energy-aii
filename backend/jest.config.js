module.exports = {
  // تحديد بيئة الاختبار
  testEnvironment: 'node',
  
  // تحديد أنماط الملفات التي سيتم اختبارها
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  
  // تجاهل بعض المجلدات
  testPathIgnorePatterns: ['/node_modules/'],
  
  // تحديد مستوى التغطية
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // تحديد المجلدات التي سيتم تضمينها في تقرير التغطية
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'services/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**'
  ],
  
  // تحديد مهلة الاختبار
  testTimeout: 30000,
  
  // تحديد ما إذا كان سيتم عرض تقدم الاختبار
  verbose: true
};
