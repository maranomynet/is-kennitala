module.exports = require('@hugsmidjan/hxmstyle')({
  // Place your project-specific additions or overrides here
  // using standard ESLint config syntax...

  // extendsFirst: [], // extended BEFORE the hxmstyle rules
  // extends: [], // added after the hxmstyle rules
  env: { node: true, es2020: true },
  rules: {
    // Require .js file extensions for all local imports.
    // Otherwise tsc emits ESM modules that don't work with Next.js
    // (and possibly other bundlers)
    'import/extensions': ['error', 'ignorePackages'],
  },
});
