(() => {
  'use strict';
  // const pluginConfig = window.tv.pluginConfig;
  const kintoneRecord = window.tv.kintoneRecord;
  const kintoneFile = window.tv.kintoneFile;
  const appId = window.tv.appId;

  const getRecords = async (query) => {
    let res = await kintoneRecord.getRecords(appId, query);
    return res;
  };

  const downloadFile = async (fileKey) => {
    return kintoneFile.download(fileKey);
  };

  const showImage = ($slide) => {
    const $slideImageEle = $slide.children('p.filekey');
    const fileKey = $slideImageEle.data('filekey');
    if (fileKey === '') {
      return;
    } else if ($slideImageEle.children('img').length > 0) {
      return;
    }

    downloadFile(fileKey).then((blob) => {
      const url = window.URL || window.webkitURL;
      $slideImageEle.append(`<img src="${url.createObjectURL(blob)}" width="100%" />`);
    });
  };

  kintone.events.on(['mobile.app.record.index.show'], (event) => {
    if (event.viewId !== 5699240) {
      return event;
    }

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
        html += `<p>${title}</p>`;
        html += `<p>${date}</p>`;
        html += '</li>';
        $('ul#tv-light-slider').append(html);
      }

      const slider = $('ul#tv-light-slider').lightSlider({
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
          const count = slider.getCurrentSlideCount();
          const $nextSlide = $el.children(`li:eq(${count})`);
          showImage($nextSlide);
        }
      });
    });

    return event;
  });

})(jQuery);
