var data = Fliplet.Widget.getData() || {};

var imageProvider = Fliplet.Widget.open('com.fliplet.image-manager', {
  selector: "#image-manager",
  single: true,
  type: 'image'
});

imageProvider.then(function (result) {
  data.image = result.data;
  save(true);
});

function save(notifyComplete) {
  Fliplet.Widget.save(data).then(function () {
    if (notifyComplete) {
      Fliplet.Widget.complete();
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
