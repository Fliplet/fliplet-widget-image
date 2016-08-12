var data = Fliplet.Widget.getData() || {};
var linkSet;
var linkActionProvider = Fliplet.Widget.open('com.fliplet.link', {
  selector: '#action',
  data: data.action
  // Removed until fixed
  /*
  onEvent: function (e) {
    // contains e.event and e.data
    linkSet = e.set;

    if (typeof linkSet == "undefined") {
      Fliplet.Widget.toggleSaveButton(true);
    } else {
      Fliplet.Widget.toggleSaveButton(linkSet);
    }

  }*/
});

// 0. Initialized Image Manager if there are no 'data'
if ( $.isEmptyObject(data) ) {
  Fliplet.Widget.open('com.fliplet.image-manager', {
    selector: "#image-manager",
    single: true,
    type: 'image'
    /*
    onEvent: function (e) {
      // contains e.event and e.data
      linkSet = e.set;
      if ( linkSet == true ) {
        Fliplet.Widget.toggleSaveButton(linkSet);
      }
    }*/
  }).then(function (result) {
    data.image = result.data;
    return Fliplet.Widget.save(data);
  }).then(function () {
    window.location.reload();
  });
};

// 1. Fired from Fliplet Studio when the external save button is clicked
Fliplet.Widget.onSaveRequest(function () {
  if ( !$.isEmptyObject(data) ) {
    $('form').submit();
  } else {
    return Fliplet.Widget.displayMessage({
      text: 'Please choose an image first.'
    });
  }
});

// 2. Fired when the user submits the form
$('form').submit(function (event) {
  event.preventDefault();
  linkActionProvider.forwardSaveRequest();
});

// 3. Fired when the provider has finished
linkActionProvider.then(function (result) {
  data.action = result.data;
  data.link = $('#link-yes').is(':checked');

  Fliplet.Widget.save(data).then(function () {
    Fliplet.Widget.complete();
  });
});

// Events
$('input[name="link-image"]:radio').on('change', showLinkActions);

// If link is set change radio button
if (data.link === 'true' || data.link === true) {
  $("#link-yes").prop("checked", true);
  $("#link-yes").change();
} else {
  $("#link-no").prop("checked", true);
  $("#link-no").change();
}

$('.button-holder .btn').on('click', showBetaAlert);

// Toggle to show and hide link actions
function showLinkActions() {
  if ($('#link-yes').is(':checked')) {
    $('#action').addClass('show');
  } else if ($('#link-no').is(':checked')) {
    $('#action').removeClass('show');
  }
}

// Temporary alerts for Beta
$('#help_tip').on('click', function() {
  alert("During beta, please use live chat and let us know what you need help with.");
});

function showBetaAlert() {
  alert("During beta, these options are disabled.");
}
