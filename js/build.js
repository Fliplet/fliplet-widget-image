$('[data-image-id]').click(function (event) {
  event.preventDefault();

  var data = Fliplet.Widget.getData($(this).data('image-id'));
  if (data.link) {
    Fliplet.Navigate.to(data.action);
    Fliplet.Analytics.trackEvent('link', 'screen', '<image>');
  }
});
