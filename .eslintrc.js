'use strict';

module.exports = {
  extends: ['@cybozu/eslint-config/presets/kintone-customize-es5'],
    'parserOptions': {
    'ecmaVersion': 8
  },
  'globals': {
    'kintoneJSSDK': true,
    'kintoneUIComponent': true,
    'KintoneConfigHelper': true,
    'List': true
  },
};
