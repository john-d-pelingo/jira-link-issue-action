module.exports = {
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testPathIgnorePatterns: ['node_modules', '.cache'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.([tj]s)$',
  testURL: 'http://localhost',
  moduleDirectories: ['node_modules', 'src'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!(gatsby)/)'],
}
