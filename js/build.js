Fliplet.Widget.instance('image', function (data) {

  var canvas = this;
  var imageUrl = data.image && data.image.url;

  if (!imageUrl) {
    return;
  }

  // Load images after DOM Load
  Fliplet.Navigator.onReady().then(function () {
    var $placeholder = $(canvas);
    var img = document.createElement('IMG');
    var propsToCopy = ['style', 'className', 'width', 'height'];
    propsToCopy.forEach(function(x){
      if (canvas.hasOwnProperty(x)) {
        img[x] = canvas[x];
      }
    });
    img.dataset.imageId = canvas.dataset.imageId;
    img.classList.remove('lazy-placeholder');
    var $img = $(img);
    $img.on('load', function(){
      $placeholder.replaceWith(this);
      $(this).hide().fadeIn(200);
    }).attr('src', imageUrl);

    if (!data.action) {
      return;
    }
    $img.on('click', function (event) {
      event.preventDefault();
      Fliplet.Navigate.to(data.action);
    });
  });
});
