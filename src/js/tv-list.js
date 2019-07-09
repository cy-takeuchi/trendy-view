(() => {
  'use strict';
  // const pluginConfig = window.tv.pluginConfig;
  const kintoneRecord = window.tv.kintoneRecord;
  const kintoneFile = window.tv.kintoneFile;
  const appId = window.tv.appId;

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
        const title = record['案件名'].value;
        const date = record['受注予定日'].value;
        let fileKey = '';
        if (record['資料'].value.length > 0) {
          fileKey = record['資料'].value[0].fileKey;
        }

        let html = '';
        html += '<li>';
        html += `<p class="filekey" data-filekey="${fileKey}"></p>`;
        html += `<p class="title">${title}</p>`;
        html += `<p>${date}</p>`;
        html += '</li>';
        $('ul#tv-light-slider').append(html);
      }

      const options = {
        valueNames: ['title']
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
          if (item.values().title.search(regexpLabel) !== -1) {
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
