Fliplet.Widget.instance('image', function (data) {

  var canvas = this;
  var imageUrl = data.image && data.image.url;

  if (!imageUrl) {
    return;
  }

  var $placeholder = $(canvas);
  var img = document.createElement('IMG');
  var propsToCopy = ['style', 'className', 'width', 'height'];
  propsToCopy.forEach(function(x){
    if (canvas.hasOwnProperty(x)) {
      img[x] = canvas[x];
    }
  });
  img.dataset.imageId = canvas.dataset.imageId;
  var $img = $(img);
  $img.on('load', function(){
    var img = this;
    $placeholder.replaceWith(img);
    setTimeout(function(){
      img.classList.remove('lazy-placeholder');
      img.classList.add('lazy-loaded');
    }, 0);
  }).attr('src', imageUrl);

  if (!data.action) {
    return;
  }
  $img.on('click', function (event) {
    event.preventDefault();
    Fliplet.Navigate.to(data.action);
  });
});
