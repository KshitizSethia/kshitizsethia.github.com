jQuery(function($) {

  $('body').addClass('postload');

  $(document).ready(function() {

    // Add fullwidth class to gallery thumbs if less than 6

    $('.imageGallery').each(function(){
      if ($(this).children('div').length <= 6) {
        $(this).children('div').addClass('fullwidth-mobile');
      }
    });    

    // Cart mobile to display if something is in cart otherwise, does not show

    function cartdisplay() {
        if (Number($('#wsite-mini-cart .wsite-subtotal-wrapper .wsite-price').text()) > 0 ) {
            $('#wsite-mini-cart').addClass('full');
            $('#footer').addClass('footer-full');
        }
        else {
            $('#wsite-mini-cart').removeClass('full');
            $('#footer').removeClass('footer-full');
        }
    }

    setTimeout(function() { cartdisplay(); }, 800);

    $('.wsite-product-button, #wsite-com-product-add-to-cart, .wsite-product-item .wsite-remove-button').on('click', function(){
      setTimeout(function() { cartdisplay(); }, 800);
    });


    // Add swipe to fancybox mobile 

    var swipeGallery = function(){

      setTimeout(function(){
          var touchGallery = document.getElementsByClassName("fancybox-wrap")[0];
          var mc = new Hammer(touchGallery);
          mc.on("panleft panright", function(ev) {
            if (ev.type == "panleft") {
              $("a.fancybox-next").trigger("click");
          }
          else if (ev.type == "panright") {
              $("a.fancybox-prev").trigger("click");
          }
          swipeGallery();
      });
      }, 500);
    }

    var setPosition = function(){
      $("#wrapper").height() < $(window).height() ? $("#wrapper").css({"position": "absolute"}) : $("#wrapper").css({"position": "relative"});
    }

    // Mobile scripts
    
    if ($(window).width() <= 1024) {
      $("body").on( "click", "a.w-fancybox", function() {
        swipeGallery();
      });

      // On page load
      setPosition();
      // In case of post-load changes (like on checkout page)
      setTimeout(function() { setPosition(); }, 1000);

      var login = $("#member-login");
      login.detach().appendTo("#navmobile .wsite-menu-default");
    }


    // Store category list click

    $('.wsite-com-sidebar').click(function(){
        if (!$(this).hasClass('sidebar-expanded')) {
            $(this).addClass('sidebar-expanded');
            if ($('#close').length === 0) {
                $("#wsite-com-hierarchy").prepend('<a id="close" href="#">CLOSE</a>');
                $('#close').click(function(e){
                    e.preventDefault();
                    setTimeout(function() {$('.wsite-com-sidebar').removeClass('sidebar-expanded');}, 50);
                });
            }
        }
    });
    
  });
});