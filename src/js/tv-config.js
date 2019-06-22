jQuery.noConflict();
(($) => {
    'use strict';

    const originalPluginConfig = window.tv.pluginConfig;

    let getSettingsUrl = () => {
        return '/k/admin/app/flow?app=' + window.tv.appId;
    }

    let saveButton = new kintoneUIComponent.Button({
        text: 'Save',
        type: 'submit'
    });
    $('div#tv-save').append(saveButton.render());


    saveButton.on('click', (e) => {
        e.preventDefault();

        let newPluginConfig = {};

        kintone.plugin.app.setConfig(newPluginConfig, () => {
            alert('Please update the app!');
            window.location.href = getSettingsUrl();
        });
    });
})(jQuery);
