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

  var canvas = this,
    imageUrl = data.image && data.image.url || 'https://placehold.it/2160x680.png?text=Image';

  if (!imageUrl) {
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
    Fliplet.Navigate.to(data.action);
  });
});
