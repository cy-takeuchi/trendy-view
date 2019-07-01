jQuery.noConflict();
(($) => {
  'use strict';

  // const originalPluginConfig = window.tv.pluginConfig;
  const appId = window.tv.appId;
  const coveredFieldTypeList = window.tv.coveredFieldTypeList;

  const getSettingsUrl = () => {
    return `/k/admin/app/flow?app=${appId}`;
  };

  const getFormFieldList = async () => {
    const res = await KintoneConfigHelper.getFields();
    return res.filter((formField) => formField.type.includes(coveredFieldTypeList));
  };

  const kUiSaveButton = new kintoneUIComponent.Button({
    text: 'Save',
    type: 'submit'
  });
  $('div#tv-save-button').append(kUiSaveButton.render());

  getFormFieldList().then((res) => {
    console.log('res', res);
  });

  kUiSaveButton.on('click', (e) => {
    e.preventDefault();

    let newPluginConfig = {};

    kintone.plugin.app.setConfig(newPluginConfig, () => {
      alert('Please update the app!');
      window.location.href = getSettingsUrl();
    });
  });
})(jQuery);
