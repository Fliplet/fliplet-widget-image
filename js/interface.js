var widgetId = Fliplet.Widget.getDefaultId();
var data = Fliplet.Widget.getData() || {};

var linkActionProvider;
var imageEditorProvider;

var files = $.extend(data.files, {
  selectFiles: [],
  selectMultiple: false,
  type: 'image',
  autoSelectOnUpload: true
});

// Load image editor if iamge is saved
if (data.image) {
  initImageEditor();
}

// Load link action
if (data.action && data.action.action === 'gallery') {
  $('#pinch').prop('checked', true);
}

if (data.action && data.action.action !== 'gallery') {
  initLinkProvider(data.action);
  $('.link-actions').addClass('show');
  $('#link').prop('checked', true);
}

if (!data.action) {
  $('#none').prop('checked', true);
}

var filePickerProvider = Fliplet.Widget.open('com.fliplet.file-picker', {
  selector: '.file-picker-holder',
  data: files,
  onEvent: function(e, data) {
    switch (e) {
      case 'widget-rendered':
        break;
      case 'widget-set-info':
        var msg = data.length ? data.length + ' files selected' : 'no selected files';
        Fliplet.Widget.info(msg);
        files.selectFiles = data.length ? data : [];
        if (data.length) {
          save();
          if (imageEditorProvider) {
            imageEditorProvider = null;
            $('.image-editor-holder').html('');
          }
          initImageEditor();
        }
        break;
      default:
        break;
    }
  },
  closeOnSave: false
});

filePickerProvider.then(function(data) {
  Fliplet.Widget.info('');
  files.selectFiles = data.data.length ? data.data : [];
  save(true);
});

function initImageEditor() {
  imageEditorProvider = Fliplet.Widget.open('com.fliplet.image-editor', {
    selector: '.image-editor-holder',
    data: {
      image: data.image
    },
    onEvent: function(e, data) {
      switch (e) {
        case 'widget-rendered':
          break;
        case 'widget-set-info':
          break;
        default:
          break;
      }
    },
    closeOnSave: false
  });

  imageEditorProvider.then(function(eventData) {
    data.image = eventData.data.image;
    save();
  });
}

//mehtod used to init the link provider
function initLinkProvider(linkAction) {
  linkActionProvider = Fliplet.Widget.open('com.fliplet.link', {
    selector: '.link-actions',
    data: linkAction,
    onEvent: function(event, data) {
      if (event === 'interface-validate') {
        Fliplet.Widget.toggleSaveButton(data.isValid === true);
      }
    },
    closeOnSave: false
  });
  linkActionProvider.then(function(result) {
    data.action = result.data;
  });
}

function save(notifyComplete) {
  data.image = files.selectFiles[0].url ? files.selectFiles[0] : data.image && data.image.url ? data.image : null;
  data.files = {
    selectFiles: files.selectFiles.length ? files.selectFiles : data.image && data.image.url ? [data.image] : []
  };

  if (data.image && data.image.size) {
    data.image.width = data.image.size[0];
    data.image.height = data.image.size[1];
  }

  if (data.image && $('#pinch').is(':checked')) {
    data.action = {};
    data.action.action = 'gallery';
    data.action.images = [data.image];
  }

  if (data.image) {
    $('.nav-tabs li').removeClass('disabled');
  }

  if ($('#none').is(':checked') && data.action) {
    data.action = null;
  }

  Fliplet.Widget.save(data).then(function() {
    if (notifyComplete) {
      Fliplet.Widget.complete();
      Fliplet.Studio.emit('reload-page-preview');
    } else {
      Fliplet.Studio.emit('reload-widget-instance', widgetId);
    }
  });
}

//handle the tap_action change event
$('input[name="tap_action"]').on('change', function() {
  if ($(this).val() === "link" && $(this).is(':checked')) {
    if (!linkActionProvider) {
      initLinkProvider();
    }
    $('.link-actions').addClass('show');
    return;
  }
  $('.link-actions').removeClass('show');
});

// 1. Fired from Fliplet Studio when the external save button is clicked
Fliplet.Widget.onSaveRequest(function() {
  if (linkActionProvider && !$('#pinch').is(':checked') && !$('#none').is(':checked')) {
    linkActionProvider.forwardSaveRequest();
  }

  if (filePickerProvider) {
    filePickerProvider.forwardSaveRequest();
    return;
  }

  save(true);
});

// Temporary alerts for Beta
$('#help_tip').on('click', function() {
  alert("During beta, please use live chat and let us know what you need help with.");
});
