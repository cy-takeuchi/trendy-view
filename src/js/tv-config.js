jQuery.noConflict();
(($) => {
  'use strict';

  // const originalPluginConfig = window.tv.pluginConfig;
  const appId = window.tv.appId;

  const getSettingsUrl = () => {
    return `/k/admin/app/flow?app=${appId}`;
  };

  const kUiSaveButton = new kintoneUIComponent.Button({
    text: 'Save',
    type: 'submit'
  });
  $('div#tv-save-button').append(kUiSaveButton.render());


  kUiSaveButton.on('click', (e) => {
    e.preventDefault();

    let newPluginConfig = {};

    kintone.plugin.app.setConfig(newPluginConfig, () => {
      alert('Please update the app!');
      window.location.href = getSettingsUrl();
    });
  });
})(jQuery);
