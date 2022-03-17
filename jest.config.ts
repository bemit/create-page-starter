import type { Config } from '@jest/types'

const base: Partial<Config.InitialOptions> = {
    moduleNameMapper: {
    },
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
        'node',
    ],
    collectCoverage: true,
    coveragePathIgnorePatterns: [
        '(tests/.*.mock).(jsx?|tsx?|ts?|js?)$',
    ],
    verbose: true,
}

const config: Config.InitialOptions = {
    ...base,
    projects: [
        {
            displayName: 'test',
            ...base,
            moduleDirectories: ['node_modules'],
            testMatch: [
                '<rootDir>/src/js/**/*.(test|spec).(js|ts|tsx)',
                //'<rootDir>/tests/**/*.(test|spec).(js|ts|tsx)',
            ],
        },
        {
            displayName: 'lint',
            runner: 'jest-runner-eslint',
            ...base,
            testMatch: [
                '<rootDir>/src/js/**/*.(js|ts|tsx)',
                //'<rootDir>/tests/**/*.(test|spec|d).(js|ts|tsx)',
            ],
        },
    ],
    coverageDirectory: '<rootDir>/coverage',
}

export default config
