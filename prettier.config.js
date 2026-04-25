module.exports = {
  plugins: ['prettier-plugin-tailwindcss'],
  printWidth: 100,
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  overrides: [
    {
      files: '*.html',
      options: {
        parser: 'angular',
      },
    },
  ],
};
