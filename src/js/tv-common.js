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

  const coveredFieldTypeList = [
    'SINGLE_LINE_TEXT'
  ];

  window.tv = window.tv || {};

  window.tv.pluginConfig = pluginConfig;
  window.tv.kintoneApp = new kintoneJSSDK.App();
  window.tv.kintoneRecord = new kintoneJSSDK.Record();
  window.tv.kintoneFile = new kintoneJSSDK.File();
  window.tv.appId = appId;
  window.tv.coveredFieldTypeList = coveredFieldTypeList;
})(kintone.$PLUGIN_ID);
