jQuery.noConflict();
(($) => {
  'use strict';
  const pluginConfig = window.tv.pluginConfig;
  const appId = window.tv.appId;

  const swipeElementId = 'sv-swipe-element';

  const detailShowEventList = [
    'mobile.app.record.detail.show'
  ];
  kintone.events.on(detailShowEventList, (event) => {
    $('div.gaia-mobile-v2-app-record-showviewpanel').wrap('<div class="swiper-container" />');
    $('div.gaia-mobile-v2-app-record-showviewpanel').wrap('<div class="swiper-wrapper" />');
    var mySwiper = new Swiper ('div.swiper-container', {
      direction: 'horizontal',
      loop: true,
      noSwipingSelector: `img#${swipeElementId}`,
      on: {
        transitionEnd: () => {
          const diff = mySwiper.touches.diff;
          if (diff > 100) {
            window.location.href = `/k/m/${appId}/?view=5699365`;
          }
        }
      }
    })
  });

})(jQuery);
