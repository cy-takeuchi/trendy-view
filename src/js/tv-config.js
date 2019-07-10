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
    const res = await KintoneConfigHelper.getFields(...coveredFieldTypeList);
    const fieldList = res.map((field) => {
      return {label: `${field.label} (${field.code})`, value: field.code};
    });
    return fieldList;
  };

  const getTableInitialData = (name, fieldList) => {
    return [
      {
        [name]: {
          items: fieldList
        }
      }
    ];
  };

  const getTableDefaultRowData = (name, fieldList) => {
    return {
      [name]: {
        items: fieldList
      }
    };
  };

  const kUiSaveButton = new kintoneUIComponent.Button({
    text: 'Save',
    type: 'submit'
  });

  kUiSaveButton.on('click', (e) => {
    e.preventDefault();
    let newPluginConfig = {};

    kintone.plugin.app.setConfig(newPluginConfig, () => {
      alert('Please update the app!');
      window.location.href = getSettingsUrl();
    });
  });

  getFormFieldList().then((fieldList) => {
    const kUiTable = new kintoneUIComponent.Table({
      data: getTableInitialData('fields', fieldList),
      defaultRowData: getTableDefaultRowData('fields', fieldList),
      columns: [
        {
          header: 'Field name',
          cell: () => { return kintoneUIComponent.createTableCell('dropdown', 'fields') }
        }
      ]
    });
    $('div#tv-field-table').append(kUiTable.render());

    $('div#tv-save-button').append(kUiSaveButton.render());
  });

})(jQuery);
