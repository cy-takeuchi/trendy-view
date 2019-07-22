((PLUGIN_ID) => {
  'use strict';

  let pluginConfig = {};
  try {
    pluginConfig = kintone.plugin.app.getConfig(PLUGIN_ID);
    for (let key of Object.keys(pluginConfig)) {
      pluginConfig[key] = JSON.parse(pluginConfig[key]);
    }
  } catch (err) {
    console.log('[ERROR]', err);
    throw new Error(err);
  }

  const getAppId = () => {
    let id = kintone.mobile.app.getId();
    if (id === null) {
      id = kintone.app.getId();
    }

    return id;
  };
  const appId = getAppId();

  const pickLocalStorage = (key) => {
    const data = localStorage.getItem(key);
    let result = null;
    if (data !== null) {
      result = JSON.parse(data);
    } else if (data === null) {
      result = 0;
    }

    return result;
  };

  const saveLocalStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const coveredFieldTypeList = [
    'SINGLE_LINE_TEXT',
    'RICH_TEXT',
    'MULTI_LINE_TEXT',
    'NUMBER',
    'CALC',
    'RADIO_BUTTON',
    'CHECK_BOX',
    'MULTI_SELECT',
    'DROP_DOWN',
    'DATE',
    'TIME',
    'DATETIME',
    'FILE',
    'LINK',
    'USER_SELECT',
    'ORGANIZATION_SELECT',
    'GROUP_SELECT',
    // 'REFERENCE_TABLE',
    // 'SPACER',
    // 'SUBTABLE',
    // 'GROUP',
    'RECORD_NUMBER',
    'CREATOR',
    'CREATED_TIME',
    'MODIFIER',
    'UPDATED_TIME'
  ];

  const tableColList = ['fields'];

  window.tv = window.tv || {};

  window.tv.pluginConfig = pluginConfig;
  window.tv.kintoneApp = new kintoneJSSDK.App();
  window.tv.kintoneRecord = new kintoneJSSDK.Record();
  window.tv.kintoneFile = new kintoneJSSDK.File();
  window.tv.appId = appId;
  window.tv.pickLocalStorage = pickLocalStorage;
  window.tv.saveLocalStorage = saveLocalStorage;
  window.tv.coveredFieldTypeList = coveredFieldTypeList;
  window.tv.tableColList = tableColList;
})(kintone.$PLUGIN_ID);
