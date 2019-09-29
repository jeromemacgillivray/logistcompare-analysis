/*jslint browser: true, vars: true, plusplus: true*/
/*global $, jQuery, TweenMax, Power1, Power0, Power2, Power3, MasterSlider, TimelineLite, WOW, KUTE*/

(function($) {
  "use strict";
  var App = {
    /*-- Init Function --*/
    init: function() {
      App.bannerScreenHeightFunction();
      App.menu();
      App.slickSyncNavCenter();
      App.slickSyncThumbnail();
      App.slickSingleSliderFunction();
      App.WowAnimateFunction();

      //Register Page
      App.registerLoginFunction();

      // Input Select Dropdown Function
      App.inputSelectFunction();

      // DatePicker Function
      App.datePickerFunction();

      //ScrollBar Function
      App.customScrollbarFunction();

      //Inner aside Navigation Function
      App.asideNavigationFunction();

      // Rating Function
      App.ratingFunction();

      //Scroll To Div
      //App.smoothScrollOffset();
    },

    bannerScreenHeightFunction: function() {
      function bannerWindowHeight() {
        var setHeight = $(window).height();
        if ($(window).width() >= 1020) {
          $(".heroBanner").css({ height: setHeight - 80 + "px" });
        } else {
          $(".heroBanner").removeAttr('style');
        }
        
      }
      bannerWindowHeight();
      $(window).resize(function() {
        bannerWindowHeight();
      });

      // Subscription Warpper Height Function
      function subscriptionHeightFunction() {
        var setHeight = $(window).height();
        if ($(window).width() >= 992) {
          $(".wHeight").css({ height: setHeight - 90 + "px" });
        } else {
          $(".wHeight").css({ height: setHeight - 60 + "px" });
        }
      }
      subscriptionHeightFunction();
      $(window).resize(function() {
        subscriptionHeightFunction();
      });
    },

    //Navigation Menu
    menu: function() {
      $(document).on("click", ".toggleMenuButton.navClosed", function() {
        $(this).addClass("navOpen");
        $(".nav-collapsed").addClass("opened");
        $("body").addClass("flowhidden");
        //TweenMax.to(".navigationWarp", 0.2, {scale:1, opacity: 1, display: "block", ease:Quad.easeIn });
      });
      $(document).on("click", ".toggleMenuButton.navOpen", function() {
        //TweenMax.to(".navigationWarp", 0.3, { opacity: "0", scale:0.8, display: "none", ease:Quad.easeOut });
        $(".toggleMenuButton.navClosed").removeClass("navOpen");
        $(".nav-collapsed").removeClass("opened");
        $("body").removeClass("flowhidden");
      });
    },

    // slick Sync Slider
    slickSyncNavCenter: function() {
      var syncFor = $(".slickSyncFor"),
        syncBy = $(".slickSyncNav");
      syncFor.slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        dots: true,
        infinite: true,
        fade: false,
        asNavFor: ".slickSyncNav"
      });
      syncBy.slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        asNavFor: ".slickSyncFor",
        dots: false,
        infinite: true,
        centerMode: true,
        adaptiveHeight: true,
        focusOnSelect: true,
        nextArrow:
          '<a href="javascript:void(0);" class="slick-next"><i class="fa fa-angle-right"></i></a>',
        prevArrow:
          '<a href="javascript:void(0);" class="slick-prev"><i class="fa fa-angle-left"></i></a>',
        responsive: [
          {
            breakpoint: 767,
            settings: {
              slidesToShow: 1
            }
          }
        ]
      });
    },

    // slick Sync Thumbnail Slider
    slickSyncThumbnail: function() {
      function slickThumbnailSlider() {
        // var syncMain = $(".slickSyncMain"),
        //   syncThumbs = $(".slickSyncThumbs");
        // syncMain.slick({
        //   slidesToShow: 1,
        //   slidesToScroll: 1,
        //   arrows: false,
        //   dots: false,
        //   infinite: false,
        //   fade: false,
        //   asNavFor: ".slickSyncThumbs"
        // });
        // syncThumbs.slick({
        //   slidesToShow: 5,
        //   slidesToScroll: 1,
        //   asNavFor: ".slickSyncMain",
        //   dots: false,
        //   infinite: false,
        //   adaptiveHeight: true,
        //   focusOnSelect: true,
        //   nextArrow:
        //     '<a href="javascript:void(0);" class="slick-next"><i class="fa fa-angle-right"></i></a>',
        //   prevArrow:
        //     '<a href="javascript:void(0);" class="slick-prev"><i class="fa fa-angle-left"></i></a>',
        //   responsive: [
        //     {
        //       breakpoint: 500,
        //       settings: {
        //         slidesToShow: 3
        //       }
        //     },
        //     {
        //       breakpoint: 400,
        //       settings: {
        //         slidesToShow: 2
        //       }
        //     }
        //   ]
        // });
      }
      slickThumbnailSlider();
      $(".modal").on("shown.bs.modal", function(e) {
        $(".slickSyncMain").resize();
        $(".slickSyncThumbs").resize();
      });
    },

    // slick Sync Slider
    slickSingleSliderFunction: function() {
      // var slickSingle = $(".slickSingle");
      // slickSingle.slick({
      //   slidesToShow: 1,
      //   slidesToScroll: 1,
      //   dots: false,
      //   infinite: false,
      //   adaptiveHeight: true,
      //   focusOnSelect: true,
      //   nextArrow:
      //     '<a href="javascript:void(0);" class="slick-next"><i class="fa fa-angle-right"></i></a>',
      //   prevArrow:
      //     '<a href="javascript:void(0);" class="slick-prev"><i class="fa fa-angle-left"></i></a>'
      // });
    },

    WowAnimateFunction: function() {
      new WOW().init();
    },

    registerLoginFunction: function() {
      function bgShapeChangefunction() {
        $(document).on("click", ".SW-Button1", function() {
          $(this).addClass("hide");
          $(this)
            .closest(".buttonWarp")
            .children(".SW-Button2")
            .removeClass("hide");
          $(this)
            .closest(".regWarpper")
            .children(".regShape")
            .addClass("regShape2")
            .removeClass("regShape1");
          $("#signIn").slideUp();
          $("html, body").animate(
            {
              scrollTop: 0
            },
            800
          );
          setTimeout(function() {
            $("#signUp").slideDown();
          }, 900);
          setTimeout(function() {
            $(".regWarpper .rightPart").addClass("signUpactive");
          }, 500);
          if ($(".regShape").hasClass("regShape2")) {
            $(".regShape .svg2").addClass("active").removeClass("translateY");
            $(".regShape .svg1").addClass("translateY");
            $(this).closest(".buttonWarp");
            setTimeout(function() {
              $(".regShape .svg1").removeClass("active");
            }, 600);
          }
        });
        $(document).on("click", ".SW-Button2", function() {
          $(this).addClass("hide");
          $(this)
            .closest(".buttonWarp")
            .children(".SW-Button1")
            .removeClass("hide");
          $(this)
            .closest(".regWarpper")
            .children(".regShape")
            .addClass("regShape1")
            .removeClass("regShape2");
          $("#signUp").slideUp();
          $("html, body").animate(
            {
              scrollTop: 0
            },
            800
          );
          setTimeout(function() {
            $("#signIn").slideDown();
          }, 900);
          setTimeout(function() {
            $(".regWarpper .rightPart").removeClass("signUpactive");
          }, 400);
          if ($(".regShape").hasClass("regShape1")) {
            $(".regShape .svg1").addClass("active").removeClass("translateY");
            $(".regShape .svg2").addClass("translateY");
            setTimeout(function() {
              $(".regShape .svg2").removeClass("active");
            }, 600);
          }
        });
      }
      bgShapeChangefunction();
    },

    inputSelectFunction: function() {
      $(".multiSelectDrop").selectpicker();
    },

    datePickerFunction: function() {
      $(".datePickerInput").datepicker({
        autoclose: true,
        zIndexOffset: 1010
      });
      $(".input-daterange").datepicker({
        autoclose: true,
        zIndexOffset: 1010
      });
    },

    customScrollbarFunction: function() {
      function cScrollBarfunction() {
        $(".boxScroll").niceScroll({
          cursorborder: "",
          cursoropacitymin: 0.1,
          cursoropacitymax: 0.3,
          cursorcolor: "#000000",
          touchbehavior: true,
          railpadding: { top: 0, right: 2, left: 0, bottom: 0 },
          horizrailenabled: false
        });
      }
      cScrollBarfunction();
      $(window).resize(function() {
        cScrollBarfunction();
      });

      function cScrollBarfunction2() {
        $(".boxScroll2").niceScroll({
          cursorborder: "",
          cursoropacitymin: 0.1,
          cursoropacitymax: 0.3,
          cursorcolor: "#000000",
          touchbehavior: false,
          horizrailenabled: false
        });
      }
      cScrollBarfunction2();
      $(window).resize(function() {
        setTimeout(function() {
          $(".boxScroll2").getNiceScroll().resize();
        }, 600);
      });
      $("#aside .collapesToggle").click(function() {
        setTimeout(function() {
          $(".boxScroll2").getNiceScroll().resize();
        }, 1200);
      });
    },

    asideNavigationFunction: function() {
      function asidenavfunction() {
        $("#aside .collapesToggle").click(function() {
          $(this).parent().toggleClass("opened");
          if ($(this).parent().hasClass("opened")) {
            setTimeout(function() {
              $("#aside .proInfo").slideDown();
            }, 700);
          } else {
            $("#aside .proInfo").slideUp();
          }
        });
      }
      asidenavfunction();
    },

    ratingFunction: function() {
      function ratingInputFunction() {
        $(".inputRating").rating({
          showClear: false,
          showCaption: false,
          emptyStar: '<i class="fa fa-star-o"></i>',
          filledStar: '<i class="fa fa-star"></i>'
        });
      }
      ratingInputFunction();
    },

    smoothScrollOffset: function() {
      $(".scrollTo").click(function(event) {
        event.preventDefault();
        var $anchor = $("#" + this.hash.substring(1));
        $("html,body").animate(
          {
            scrollTop:
              $anchor.offset().top - $anchor.attr("data-section-offset")
          },
          500
        );

        if ($(".sidebreadCrumb a").hasClass("active")) {
          $(".sidebreadCrumb a").removeClass("active");
          $(this).addClass("active");
        }
      });
    }
  };
  $(function() {
    App.init();
  });
})(jQuery);
