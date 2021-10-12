import $ from "jquery";

$(document).ready(() => {
  $('.wd_single_index_menu ul li a[href^="#"]').bind("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    var $anchor = $(this);
    if ($(window).width() > 991) {
      var headerH = "60";
    } else {
      headerH = "56";
    }
    $("html, body")
      .stop()
      .animate(
        {
          scrollTop: $($anchor.attr("href")).offset().top - headerH + "px",
        },
        800
      );
  });
  $(window).scroll(function () {
    var windscroll = $(window).scrollTop();
    var target = $(".wd_single_index_menu ul li");
    if (windscroll >= 0) {
      $(".wd_scroll").each(function (i) {
        if ($(this).position().top <= windscroll + 90) {
          target.removeClass("active");
          target.eq(i).addClass("active");
        }
      });
    } else {
      target.removeClass("active");
      $(".wd_single_index_menu ul li:first").addClass("active");
    }
  });
});
