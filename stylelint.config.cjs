module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    'stylelint-config-rational-order',
  ],
  plugins: ['stylelint-prettier'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'unocss',
          'apply',
          'variants',
          'responsive',
          'screen',
        ],
      },
    ],
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'unocss',
          'apply',
          'variants',
          'responsive',
          'screen',
        ],
      },
    ],
  },
}
