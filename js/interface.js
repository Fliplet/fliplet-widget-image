var data = Fliplet.Widget.getData() || {};

// Load interface data
if (data.action && data.action.action === 'gallery') {
  $('#gallery').prop('checked', true);
}

var imageProvider = Fliplet.Widget.open('com.fliplet.image-manager', {
  selector: "#image-manager",
  single: true,
  type: 'image'
});

imageProvider.then(function (result) {
  data.image = result.data || data.image;
  data.action = {};
  if (data.image && $('#gallery').is(":checked")) {
    data.action.action = 'gallery';
    data.action.images = [data.image];
  }
  save(true);
});

function save(notifyComplete) {
  Fliplet.Widget.save(data).then(function () {
    if (notifyComplete) {
      Fliplet.Widget.complete();
      Fliplet.Studio.emit('reload-page-preview');
    }
  });
}

// 1. Fired from Fliplet Studio when the external save button is clicked
Fliplet.Widget.onSaveRequest(function () {
  imageProvider.forwardSaveRequest();
});

// Events
$('.button-holder .btn').on('click', showBetaAlert);

// Temporary alerts for Beta
$('#help_tip').on('click', function() {
  alert("During beta, please use live chat and let us know what you need help with.");
});

function showBetaAlert() {
  alert("During beta, these options are disabled.");
}

