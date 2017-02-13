Fliplet.Widget.instance('image', function (data) {
  var $el = $(this);
  var img;
  var imageUrl = data.image && data.image.url;

  // Load images after DOM Load
  if (imageUrl && !$el.attr('src')) {
    Fliplet.Navigator.onReady().then(function () {
      $el[0].src = imageUrl;
    });
  }

  $el.click(function (event) {
    event.preventDefault();

    if (data.action) {
      Fliplet.Navigate.to(data.action);
    }
  });
});