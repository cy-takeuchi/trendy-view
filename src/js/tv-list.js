(() => {
    'use strict';

    const pluginConfig = window.tv.pluginConfig;
    console.log(pluginConfig);

    let getRecords = async (query) => {
        let res = await window.tv.kintoneRecord.getRecords(window.tv.appId, query);
        return res;
    }

    let createColumnList = (record) => {
        let columnList = {};
        let i = 0;
        for (let fieldCode of Object.keys(record)) {
            columnList[`column${i}`] = fieldCode;
            i++;
        }

        return columnList;
    }

    let createValueNames = (columnList) => {
        return Object.keys(columnList);
    }

    let createListHeader = (columnList) => {
        let item = '<tr>';
        for (let key of Object.keys(columnList)) {
            item += `<td><div class="${key}"></div></td>`;
        }
        item += '</tr>';

        return item;
    }

    let createItemList = (columnList, records) => {
        let result = [];
        for (let record of records) {
            let item = {};
            console.log(record);
            for (let key of Object.keys(columnList)) {
                let fieldCode = columnList[key];
                item[key] = record[fieldCode].value;
            }
            result.push(item);
        }

        return result;
    }

    kintone.events.on(['mobile.app.record.index.show'], (event) => {
        if (event.viewId !== 5698734) {
            return event;
        }

        getRecords('').then((res) => {
            let records = res.records;

            let columnList = [];
            for (let i = 0; i < records.length; i++) {
                let record = records[i];
                if (i === 0) {
                    columnList = createColumnList(record);
                }

            }

            let options = {
                valueNames: createValueNames(columnList),
                item: createListHeader(columnList)
            };

            let itemList = createItemList(columnList, records);

            let list = new List('tv-list', options, itemList);
        });
    });

})();
