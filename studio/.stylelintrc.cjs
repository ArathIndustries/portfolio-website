/*
 * Stylesheet lint for the studio, the same idea as the hub's frontend/.stylelintrc.cjs
 * (hub design/ui-standard.md section 8). It fails on two kinds of drift:
 *   - a literal hex colour (color-no-hex); the tokens live in studio/tokens.css, which carries a
 *     stylelint-disable comment and mirrors the hub's workspace.css;
 *   - a literal colour or font-size where a token is expected (declaration-strict-value).
 * Scope: studio/** only (the config sits in this folder; `npm run lint:studio:css` passes the
 * glob). Existing violations are frozen in studio/lint-baseline.json; `npm run
 * lint:studio:css:delta` fails only on violations that are not in it.
 * Not ported: the hub's control-height plugin (hub/ws-control-height-token); the studio's
 * controls take their height from .studio-btn / .studio-input in studio.css.
 */
module.exports = {
  extends: ['stylelint-config-recommended'],
  plugins: ['stylelint-declaration-strict-value'],
  ignoreFiles: ['**/node_modules/**', '**/.studio-dist/**'],
  rules: {
    'color-no-hex': true,
    'scale-unlimited/declaration-strict-value': [
      ['color', 'background-color', 'border-color', 'font-size'],
      {
        ignoreValues: [
          'transparent', 'inherit', 'currentColor', 'currentcolor', 'none', 'initial', 'unset', 'revert', '0',
          // The iOS zoom floor for text fields on the phone; not a hub size (studio.css explains).
          '16px'
        ],
        // A function (var(), rgba(), color-mix()) counts as a token source. Hex is caught above.
        ignoreFunctions: true,
        expandShorthand: true,
        disableFix: true
      }
    ],
    // Tailwind 4 at-rules used by studio.css.
    'at-rule-no-unknown': [true, { ignoreAtRules: ['source', 'theme', 'plugin', 'custom-variant', 'apply', 'utility', 'variant', 'reference'] }],
    // Order-of-rules noise, not drift; the standard does not speak to it.
    'no-descending-specificity': null
  }
}
