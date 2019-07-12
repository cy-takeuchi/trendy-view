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
    if (event.viewId !== 5699240) {
      return event;
    }

    showSearchBox();

    getRecords('').then((res) => {
      const records = res.records;

      for (let record of records) {
        let html = '';
        html += '<li>';
        for (const showField of pluginConfig.showFieldList) {
          const [fieldType, fieldCode] = showField[tableColList[0]].value.split(':');
          if (fieldType === 'FILE') {
            let fileKey = '';
            if (record[fieldCode].value.length > 0) {
              fileKey = record['資料'].value[0].fileKey;
              html += `<p class="filekey" data-filekey="${fileKey}"></p>`;
            }
          } else {
            html += `<p class="col">${record[fieldCode].value}</p>`;
          }
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
