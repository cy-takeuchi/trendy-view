jQuery.noConflict();
(($) => {
  'use strict';

  const originalPluginConfig = window.tv.pluginConfig;
  const appId = window.tv.appId;
  const coveredFieldTypeList = window.tv.coveredFieldTypeList;
  const tableColList = window.tv.tableColList;

  const getSettingsUrl = () => {
    return `/k/admin/app/flow?app=${appId}`;
  };

  const getFormFieldList = async () => {
    const res = await KintoneConfigHelper.getFields(coveredFieldTypeList);
    const fieldList = res.map((field) => {
      return {label: `${field.label} (${field.code})`, value: `${field.type}:${field.code}`};
    });
    return fieldList;
  };

  const getTableInitialData = (tableColList, fieldList) => {
    let res = {};
    for (const tableCol of tableColList) {
      res[tableCol] = {
        items: fieldList
      }
    }

    return [res];
  };

  const getTableDefaultRowData = (tableColList, fieldList) => {
    let res = {};
    for (const tableCol of tableColList) {
      res[tableCol] = {
        items: fieldList
      }
    }

    return res;
  };

  const kUiSaveButton = new kintoneUIComponent.Button({
    text: 'Save',
    type: 'submit'
  });

  getFormFieldList().then((fieldList) => {
    const kUiTable = new kintoneUIComponent.Table({
      data: getTableInitialData(tableColList, fieldList),
      defaultRowData: getTableDefaultRowData(tableColList, fieldList),
      columns: [
        {
          header: 'Field name',
          cell: () => {
            return kintoneUIComponent.createTableCell('dropdown', tableColList[0]);
          }
        }
      ]
    });
    $('div#tv-field-table').append(kUiTable.render());

    $('div#tv-save-button').append(kUiSaveButton.render());

    if (originalPluginConfig.showFieldList !== undefined) {
      for (const showField of originalPluginConfig.showFieldList) {
        for (const tableCol of tableColList) {
          // フィールドが増加した場合に、増加した分も含んだドロップダウンにする
          showField[tableCol].items = fieldList;

          // フィールドが減少した場合に、減少した分を選択していた場合は未選択にする
          const selectedValue = showField[tableCol].value;
          const containsDropdown = showField[tableCol].items.find(item => item.value === selectedValue);
          if (containsDropdown === undefined) {
            showField[tableCol].value = undefined;
          }
        }
      }
      kUiTable.setValue(originalPluginConfig.showFieldList);
    }

    kUiSaveButton.on('click', (e) => {
      e.preventDefault();
      let newPluginConfig = {};
      newPluginConfig.showFieldList = JSON.stringify(kUiTable.getValue());

      kintone.plugin.app.setConfig(newPluginConfig, () => {
        alert('Please update the app!');
        window.location.href = getSettingsUrl();
      });
    });
  });

})(jQuery);
