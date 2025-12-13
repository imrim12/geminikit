import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  rules: {
    'unused-imports/no-unused-imports': 'error',
    'no-alert': 'warn',
    'no-console': 'off',
    'no-debugger': 'warn',
    'node/prefer-global/process': 'off',
  },
})
