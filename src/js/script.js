
jQuery(function ($) {
  // スムーススクロール (絶対パスのリンク先が現在のページであった場合でも作動。ヘッダーの高さ考慮。)
  $(document).on('click', 'a[href*="#"]', function () {
    let time = 400;
    let header = $('header').innerHeight();
    let target = $(this.hash);
    if (!target.length) return;
    let targetY = target.offset().top - header;
    $('html,body').animate({ scrollTop: targetY }, time, 'swing');
    return false;
  });

  $(function () {
    const $hamburger = $('.p-header__hamburger');
    const $gnav = $('#global-menu');
    const $close = $('.p-gnav__close');

    function openMenu() {
      $hamburger.addClass('is-open').attr('aria-expanded', 'true');
      $gnav.addClass('is-open').attr('aria-hidden', 'false');
    }

    function closeMenu() {
      $hamburger.removeClass('is-open').attr('aria-expanded', 'false');
      $gnav.removeClass('is-open').attr('aria-hidden', 'true');
    }

    $hamburger.on('click', function () {
      $gnav.hasClass('is-open') ? closeMenu() : openMenu();
    });

    $close.on('click', function () {
      closeMenu();
    });

    $gnav.find('a').on('click', function () {
      closeMenu();
    });
  });
});
