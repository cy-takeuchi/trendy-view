jQuery.noConflict();
(($) => {
  'use strict';

  const pluginConfig = window.tv.pluginConfig;
  const kintoneRecord = window.tv.kintoneRecord;
  const kintoneFile = window.tv.kintoneFile;
  const appId = window.tv.appId;
  const tableColList = window.tv.tableColList;
  const pickLocalStorage = window.tv.pickLocalStorage;
  const saveLocalStorage = window.tv.saveLocalStorage;

  const subdomain = window.location.hostname.split('.')[0];
  const lsSearchWord = `tv-${subdomain}-${appId}-word`; // 検索ワード
  const lsSlidePage = `tv-${subdomain}-${appId}-page`; // 表示していたスライドのページ

  const getRecords = (query) => {
    return kintoneRecord.getRecords(appId, query);
  };

  const downloadFile = (fileKey) => {
    return kintoneFile.download(fileKey);
  };

  const showImage = ($slide) => {
    const $slideImageEle = $slide.children('a').children('p.filekey');
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
    if (value === '') {
      html += ''; // 添付ファイルの場合
    } else if (label === '') {
      html += `<p>${value}</p>`;
    } else {
      html += `<p>${value}<span class="label"> (${label})</span></p>`;
    }

    return html;
  };

  const createDetailUrl = (viewId, rId) => {
    return `/k/m/${appId}/show?record=${rId}&view=${viewId}`;
  };

  const sliderConfig = {
    item: 1,
    pager: false,
    onSliderLoad: ($el) => {
      $el.css('height', '100%');
    },
    onAfterSlide: ($el) => {
      const count = $el.getCurrentSlideCount();
      const $nextSlide = $el.children(`li:eq(${count})`);
      showImage($nextSlide);

      const $prevSlide = $el.children(`li:eq(${count - 1})`);
      showImage($prevSlide);

      saveLocalStorage(lsSlidePage, count - 1);
    }
  };

  const indexShowEventList = [
    'mobile.app.record.index.show'
  ];
  kintone.events.on(indexShowEventList, (event) => {
    const viewId = event.viewId;
    if (viewId !== 5699365 && viewId !== 5698734) {
      return event;
    }

    showSearchBox();

    const query = kintone.mobile.app.getQueryCondition();
    getRecords(query).then((res) => {
      for (const record of res.records) {
        const rId = record.$id.value;
        const url = createDetailUrl(viewId, rId);

        let html = '';
        html += `<li><a href="${url}">`;

        let allValue = []; // 検索用
        for (const showField of pluginConfig.showFieldList) {
          const [fieldType, fieldCode, fieldLabel] = showField[tableColList[0]].value.split(':');
          if (record[fieldCode] === undefined) {
            continue; // プラグインで設定したが、フィールドが削除された場合
          }

          const fieldValue = record[fieldCode].value;

          let value = '';
          let label = '';
          if (fieldValue === null || fieldValue === ''
            || (Array.isArray(fieldValue) === true && fieldValue.length === 0)) {
            value = '&nbsp;';
          } else if (fieldType === 'DATE' || fieldType === 'TIME' || fieldType === 'NUMBER' || fieldType === 'CALC') {
            label = fieldLabel;
            value = fieldValue;
            allValue.push(value);
          } else if (fieldType === 'DATETIME' || fieldType === 'CREATED_TIME' || fieldType === 'UPDATED_TIME') {
            const date = new Date(fieldValue);
            label = fieldLabel;
            value = date.toLocaleString();
            allValue.push(value);
          } else if (fieldType === 'USER_SELECT' || fieldType === 'GROUP_SELECT' || fieldType === 'ORGANIZATION_SELECT') {
            const valueList = fieldValue.map((v) => v.name);
            label = fieldLabel;
            value = valueList.join(',');
            allValue.push(valueList.join(' '));
          } else if (fieldType === 'CREATOR' || fieldType === 'MODIFIER') {
            label = fieldLabel;
            value = fieldValue.name;
            allValue.push(value);
          } else if (fieldType === 'RICH_TEXT') {
            label = fieldLabel;
            value = fieldValue.replace(/<[^>]*>/g, ' ');
            allValue.push(value);
          } else if (fieldType === 'FILE') {
            const fileKey = fieldValue[0].fileKey;
            html += `<p class="filekey" data-filekey="${fileKey}"></p>`;
          } else {
            value = fieldValue;
            allValue.push(value);
          }
          html += createSliderData(value, label);
        }
        html += `<p class="value">${allValue.join(' ')}</p>`;
        html += '</a></li>';
        $('ul#tv-light-slider').append(html);
      }

      const options = {
        valueNames: ['value']
      };
      const list = new List('tv-list', options);
      let lastWord = '';

      const firstSearchWord = pickLocalStorage(lsSearchWord);
      if (firstSearchWord !== '') {
        $('input#tv-search-text').val(firstSearchWord);
        list.search(firstSearchWord);
        lastWord = firstSearchWord;
      }

      let slider = $('ul#tv-light-slider').lightSlider(sliderConfig);
      let slidePage = pickLocalStorage(lsSlidePage);
      if (list.visibleItems.length < 4) {
        for (let i = 0; i < list.visibleItems.length; i++) {
          const $currentSlide = $('ul#tv-light-slider').children(`li:eq(${i})`);
          showImage($currentSlide);
        }
      } else {
        for (let i = slidePage - 1; i <= slidePage + 1; i++) {
          const $currentSlide = $('ul#tv-light-slider').children(`li:eq(${i})`);
          showImage($currentSlide);
        }
      }

      slider.goToSlide(slidePage);

      const searchList = () => {
        const word = $('input#tv-search-text').val();

        // 同じ検索ワードの場合はスキップする
        if (word === lastWord) {
          return;
        }

        saveLocalStorage(lsSearchWord, word);
        list.search(word);

        lastWord = word;

        slider.destroy();
        slider = $('ul#tv-light-slider').lightSlider(sliderConfig);

        const $currentSlide = $('ul#tv-light-slider').children(`li:eq(0)`);
        showImage($currentSlide);

        const $nextSlide = $('ul#tv-light-slider').children(`li:eq(1)`);
        showImage($nextSlide);
      };

      // keyup: キー入力
      // compositionend: キーの保管入力
      // change: マイク入力
      $(document).on('keyup compositionend change', 'input#tv-search-text', $.debounce(500, searchList));
    });

    return event;
  });

})(jQuery);
