((PLUGIN_ID) => {
    'use strict';

    let pluginConfig = {};
    try {
        pluginConfig = kintone.plugin.app.getConfig(PLUGIN_ID);
        for (let key of Object.keys(pluginConfig)) {
            pluginConfig[key] = JSON.parse(pluginConfig[key]);
        }
    } catch (e) {
        console.log(`[ERROR]: ${e}`);
        return;
    }

    const getAppId = () => {
        let id = kintone.mobile.app.getId();
        if (id === null) {
            id = kintone.app.getId();
        }

        return id;
    }



    const conn = new kintoneJSSDK.Connection();
    const appId = getAppId();

    window.tv = window.tv || {};

    window.tv.pluginConfig = pluginConfig;
    window.tv.kintoneApp = new kintoneJSSDK.App(conn);
    window.tv.kintoneRecord = new kintoneJSSDK.Record(conn);
    window.tv.appId = appId;
})(kintone.$PLUGIN_ID);
