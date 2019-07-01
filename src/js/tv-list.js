(() => {
  'use strict';
  // const pluginConfig = window.tv.pluginConfig;

  const getRecords = async (query) => {
    let res = await window.tv.kintoneRecord.getRecords(window.tv.appId, query);
    return res;
  };

  kintone.events.on(['mobile.app.record.index.show'], (event) => {
    if (event.viewId !== 5699240) {
      return event;
    }

    getRecords('').then((res) => {
      const records = res.records;

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const title = record['案件名'].value;
        const date = record['受注予定日'].value;
        let html = '';
        html += '<li>';
        html += `<p>${title}</p>`;
        html += `<p>${date}</p>`;
        html += '</li>';
        $('ul#tv-light-slider').append(html);
      }

      $('ul#tv-light-slider').lightSlider({
        item: 1,
        pager: false
      });
    });

    return event;
  });

})(jQuery);
