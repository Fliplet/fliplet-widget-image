var widgetData = Fliplet.Widget.getData();

// Fired from Fliplet Studio when the external save button is clicked
Fliplet.Widget.onSaveRequest(function () {
  Fliplet.Widget.save(getFormData()).then(function () {
    Fliplet.Widget.complete();
  });
})

if (!widgetData) {
  Fliplet.Widget.open('com.fliplet.image-manager', {
    selector: "#image-manager",
    single: true,
    type: 'image'
  }).then(function (result) {
    data.image = result.data;

    return Fliplet.Widget.save(data);
  }).then(function () {
    window.location.reload();
  });
};
