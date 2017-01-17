$('[data-image-id]').click(function (event) {
  event.preventDefault();

  var data = Fliplet.Widget.getData($(this).data('image-id'));
  if (data.action) {
    Fliplet.Navigate.to(data.action);
    Fliplet.Analytics.trackEvent('link', 'screen', '<image>');
  }
});
