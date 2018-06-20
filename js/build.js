Fliplet.Widget.instance('image', function (data) {

  $.fn.fadeInImg = function (img) {
    return $(this).each(function () {
      var $placeholder = $(this);
      $placeholder.replaceWith(img);
      setTimeout(function () {
        img.classList.add('lazy-loaded');
        setTimeout(function () {
          img.classList.remove('lazy-placeholder');
          $(img).trigger('loaded.bs.banner')
        }, 0);
      }, 0);
    });
  };

  var photoswipeHtml = '<!-- Root element of PhotoSwipe. Must have class pswp. --> <div class="pswp" tabindex="-1" role="dialog" aria-hidden="true"> <!-- Background of PhotoSwipe. It s a separate element as animating opacity is faster than rgba(). --> <div class="pswp__bg"></div> <!-- Slides wrapper with overflow:hidden. --> <div class="pswp__scroll-wrap"> <!-- Container that holds slides. PhotoSwipe keeps only 3 of them in the DOM to save memory. Don t modify these 3 pswp__item elements, data is added later on. --> <div class="pswp__container"> <div class="pswp__item"></div> <div class="pswp__item"></div> <div class="pswp__item"></div> </div> <!-- Default (PhotoSwipeUI_Default) interface on top of sliding area. Can be changed. --> <div class="pswp__ui pswp__ui--hidden"> <div class="pswp__top-bar"> <!-- Controls are self-explanatory. Order can be changed. --> <div class="pswp__counter"></div> <button class="pswp__button pswp__button--close" title="Close (Esc)"></button> <!-- <button class="pswp__button pswp__button--share" title="Share"> --> </button> <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button> <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button> <!-- Preloader demo http://codepen.io/dimsemenov/pen/yyBWoR --> <!-- element will get class pswp__preloader--active when preloader is running --> <div class="pswp__preloader"> <div class="pswp__preloader__icn"> <div class="pswp__preloader__cut"> <div class="pswp__preloader__donut"></div> </div> </div> </div> </div> <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap"> <div class="pswp__share-tooltip"></div> </div> <button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"> </button> <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"> </button> <div class="pswp__caption"> <div class="pswp__caption__center"></div> </div> </div> </div> </div>';
  var canvas = this,
    imageUrl = data.image && data.image.url || 'https://placehold.it/2160x680.png?text=Image';

  if (!imageUrl) {
    return;
  }

  if (data.image && !Fliplet.Env.get('interact') && data.fullScreen) {
    if (!$('.pswp').length) {
      $('[data-widget-id="' + data.id + '"]').append($(photoswipeHtml));
    }

    var pswpElement = document.querySelectorAll('.pswp')[0];
    var items = [
      {
        src: data.image.url,
        w: data.image.width,
        h: data.image.height,
        msrc: data.image.versions['640>'].url
      }
    ];
    var options = {
      closeOnScroll: false,
      pinchToClose: false,
      closeOnVerticalDrag: false,
      clickToCloseNonZoomable: false,
      closeElClasses: [],
      escKey: false,
      index: 0
    };
    var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);

    // Start full screen image
    gallery.init();
    return;
  }

  if (Fliplet.Env.get('interact') && data.fullScreen) {
    return;
  }

  var $placeholder = $(canvas);
  var img = document.createElement('IMG');
  img.className = canvas.className;
  img.style = canvas.style;
  img.width = canvas.width;
  img.height = canvas.height;
  img.dataset.imageId = canvas.dataset.imageId;
  var $img = $(img);
  $img.on('load', function(){
    $placeholder.fadeInImg(this);
  }).on('error', function(){
    $placeholder.fadeInImg(this);

    if (typeof Raven !== 'undefined' && Raven.captureMessage) {
      Raven.captureMessage('Error loading image', {
        user: Fliplet.User.get('id'),
        app: Fliplet.Env.get('appId'),
        page: Fliplet.Env.get('pageId'),
        image: data.image
      });
    }
  }).attr('src', imageUrl);

  if (!data.action) {
    return;
  }
  $img.on('click', function (event) {
    event.preventDefault();
    if (data.action) {
      // Set the title for GA Event
      data.action.title = '<image>';
      // Navigate
      Fliplet.Navigate.to(data.action);
    }
  });
});
