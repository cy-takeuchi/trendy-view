jQuery.noConflict();
(($) => {
  'use strict';
  const pluginConfig = window.tv.pluginConfig;
  const kintoneRecord = window.tv.kintoneRecord;
  const kintoneFile = window.tv.kintoneFile;
  const appId = window.tv.appId;
  const tableColList = window.tv.tableColList;

  const getRecords = (query) => {
    return kintoneRecord.getRecords(appId, query);
  };

  const downloadFile = (fileKey) => {
    return kintoneFile.download(fileKey);
  };

  const showImage = ($slide) => {
    const $slideImageEle = $slide.children('p.filekey');
    const fileKey = $slideImageEle.data('filekey');
    if (fileKey === '' || fileKey === undefined) {
      return;
    } else if ($slideImageEle.children('img').length > 0) {
      return;
    }

    downloadFile(fileKey).then((blob) => {
      const url = window.URL || window.webkitURL;
      $slideImageEle.append(`<img src="${url.createObjectURL(blob)}" width="100%" />`);
    });
  };

  const showSearchBox = () => {
    const el = kintone.mobile.app.getHeaderSpaceElement();
    let html = '';
    html += '<div id="tv-header">';
    html += '<input type="text" id="tv-search-text" />';
    html += '</div>';
    $(el).append(html);
  };

  const createSliderData = (value, label = '') => {
    let html = '';
    if (label === '') {
      html += `<p class="col">${value}</p>`;
    } else {
      html += `<p class="col">${value} <span class="label">(${label})</span></p>`;
    }

    return html;
  };

  const sliderConfig = {
    item: 1,
    pager: false,
    onSliderLoad: ($el) => {
      $el.css('height', '100%');

      const $currentSlide = $el.children(`li:eq(0)`);
      showImage($currentSlide);
      const $nextSlide = $el.children(`li:eq(1)`);
      showImage($nextSlide);
    },
    onAfterSlide: ($el) => {
      const count = $el.getCurrentSlideCount();
      const $nextSlide = $el.children(`li:eq(${count})`);
      showImage($nextSlide);
    }
  };

  const indexShowEventList = [
    'mobile.app.record.index.show'
  ];
  kintone.events.on(indexShowEventList, (event) => {
    if (event.viewId !== 5699365 && event.viewId !== 5698734) {
      return event;
    }

    showSearchBox();

    getRecords('').then((res) => {
      const records = res.records;

      for (let record of records) {
        let html = '';
        html += '<li>';
        for (const showField of pluginConfig.showFieldList) {
          const [fieldType, fieldCode, fieldLabel] = showField[tableColList[0]].value.split(':');
          const fieldValue = record[fieldCode].value;

          let value = '';
          let label = '';
          if (fieldValue === null || fieldValue === ''
            || (Array.isArray(fieldValue) === true && fieldValue.length === 0)) {
            value = '&nbsp;';
          } else if (fieldType === 'DATE' || fieldType === 'TIME') {
            label = fieldLabel;
            value = fieldValue;
          } else if (fieldType === 'DATETIME' || fieldType === 'CREATED_TIME' || fieldType === 'UPDATED_TIME') {
            const date = new Date(fieldValue);
            label = fieldLabel;
            value = date.toLocaleString();
          } else if (fieldType === 'USER_SELECT' || fieldType === 'GROUP_SELECT' || fieldType === 'ORGANIZATION_SELECT') {
            const valueList = fieldValue.map((v) => v.name);
            label = fieldLabel;
            value = valueList.join(',');
          } else if (fieldType === 'CREATOR' || fieldType === 'MODIFIER') {
            label = fieldLabel;
            value = fieldValue.name;
          } else if (fieldType === 'RICH_TEXT') {
            label = fieldLabel;
            value = fieldValue.replace(/<[^>]*>/g, ' ');
          } else if (fieldType === 'FILE') {
            const fileKey = fieldValue[0].fileKey;
            html += `<p class="filekey" data-filekey="${fileKey}"></p>`;
          } else {
            value = fieldValue;
          }
          html += createSliderData(value, label);
        }
        html += '</li>';
        $('ul#tv-light-slider').append(html);
      }

      const options = {
        valueNames: ['col']
      };
      const list = new List('tv-list', options);

      let slider = $('ul#tv-light-slider').lightSlider(sliderConfig);

      let lastWord = '';
      const searchList = () => {
        const word = $('input#tv-search-text').val();

        // 同じ検索ワードの場合はスキップする
        if (word === lastWord) {
          return;
        }

        const regexpLabel = new RegExp(word);
        list.filter((item) => {
          if (item.values().col.search(regexpLabel) !== -1) {
            return true;
          }
          return false;
        });

        lastWord = word;

        slider.destroy();
        slider = $('ul#tv-light-slider').lightSlider(sliderConfig);
      };

      $(document).on('keyup compositionend', 'input#tv-search-text', $.debounce(500, searchList));
    });

    return event;
  });

})(jQuery);
