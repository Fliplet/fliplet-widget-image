var widgetData = Fliplet.Widget.getData();

function getFormData() {
  return {
    width: $('[name="width"]').val() || '100%'
  }
}

// Fired from Fliplet Studio when the external save button is clicked
Fliplet.Widget.onSaveRequest(function () {
  Fliplet.Widget.save(getFormData()).then(function () {
    Fliplet.Widget.complete();
  });
})

$('[data-select-image]').click(function (event) {
  event.preventDefault();

  Fliplet.Widget.open('com.fliplet.file-manager', {
    single: true,
    type: 'image'
  }).then(function (result) {
    var data = getFormData();
    data.image = result.data;

    return Fliplet.Widget.save(data);
  }).then(function () {
    window.location.reload();
  });
});

// Open the file manager if no image has been selected
if (!widgetData) {
  $('[data-select-image]').click();
}