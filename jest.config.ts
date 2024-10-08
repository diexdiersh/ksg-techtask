/* eslint-disable n/no-unpublished-import */

import {JestConfigWithTsJest} from 'ts-jest'

const jestConfig: JestConfigWithTsJest = {
  preset: 'ts-jest',
  verbose: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  roots: ['src'],
  testRegex: '.test.ts$',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {tsconfig: 'tsconfig.build.json', isolatedModules: true, useESM: true},
    ],
  },
  maxConcurrency: 10,
  collectCoverageFrom: ['src/**/*.ts', '!**/node_modules/**'],
  coverageReporters: ['html', 'text', 'text-summary', 'cobertura'],
}

export default jestConfig
