/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  'src/**/*.ts': [
    (files) => 'vue-tsc -p tsconfig.app.json --noEmit',
    'eslint --fix',
  ],
  'src/**/*.vue': [
    (files) => 'vue-tsc -p tsconfig.app.json --noEmit',
    'eslint --fix',
  ],
  'src/**/*.{js,jsx}': ['eslint --fix'],
};
