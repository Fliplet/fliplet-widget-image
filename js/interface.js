var data = Fliplet.Widget.getData() || {};
var linkActionProvider = Fliplet.Widget.open('com.fliplet.link', {
  selector: '#action',
  data: data.action
});

// 3. Fired when the provider has finished
linkActionProvider.then(function (result) {
  data.action = result.data;
  return Fliplet.Widget.save(data);
}).then(function () {
  window.location.reload();
});

if (data !== {}) {
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

// Fired from Fliplet Studio when the external save button is clicked
Fliplet.Widget.onSaveRequest(function () {
  Fliplet.Widget.save(data).then(function () {
    Fliplet.Widget.complete();
  });
})

function showLinkActions() {
  if ($('#link-yes').is(':checked')) {
    $('#action').addClass('show');
  } else if ($('#link-no').is(':checked')) {
    $('#action').removeClass('show');
  }
}

$('input[name="link-image"]:radio').on('change', function() {
  showLinkActions();
});
