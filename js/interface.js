var widgetId = Fliplet.Widget.getDefaultId();
var data = Fliplet.Widget.getData() || {};

var filePickerProvider;
var imageEditorProvider;
var linkActionProvider;

var filePickerData;

function init() {
  filePickerInit();
  imageEditorInit();

  // Load link action
  if (data.action && data.action.action === 'gallery') {
    $('#pinch').prop('checked', true);
  }

  if (data.action && data.action.action !== 'gallery') {
    linkProviderInit(data.action);
    $('.link-actions').addClass('show');
    $('#link').prop('checked', true);
  }

  if (!data.action) {
    $('#none').prop('checked', true);
  }

  attahObservers();
}

function attahObservers() {
  // Handle the tap_action change event
  $('input[name="tap_action"]').on('change', function() {
    if ($(this).val() === "link" && $(this).is(':checked')) {
      if (!linkActionProvider) {
        linkProviderInit();
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
}

function filePickerDataInit() {
  filePickerData = $.extend(true, data.files, {
    selectFiles: [],
    selectMultiple: false,
    type: 'image',
    fileExtension: ['JPG', 'JPEG', 'PNG', 'GIF', 'TIFF'],
    autoSelectOnUpload: true
  });
}

function filePickerInit() {
  filePickerDataInit();
  if (filePickerProvider) {
    filePickerProvider = null;
    $('.file-picker-holder').html('');
  }
  filePickerProvider = Fliplet.Widget.open('com.fliplet.file-picker', {
    selector: '.file-picker-holder',
    data: filePickerData,
    onEvent: function(e, data) {
      switch (e) {
        case 'widget-rendered':
          break;
        case 'widget-set-info':
          var msg = data.length ? data.length + ' files selected' : 'no selected files';
          Fliplet.Widget.info(msg);
          filePickerData.selectFiles = data.length ? data : [];
          if (data.length) {
            save();
            if (filePickerData.selectFiles[0].id !== data[0].id) {
              imageEditorInit();
            }
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
    filePickerData.selectFiles = data.data.length ? data.data : [];
    save(true);
  });
}

function imageEditorInit() {
  if (!data.image) {
    return;
  }

  if (imageEditorProvider) {
    imageEditorProvider = null;
    $('.image-editor-holder').html('');
  }
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
    filePickerData.selectFiles[0] = eventData.data.image;
    save();
    filePickerInit();
  });
}

//mehtod used to init the link provider
function linkProviderInit(linkAction) {
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
  data.image = (filePickerData.selectFiles.length && filePickerData.selectFiles[0].url) ? filePickerData.selectFiles[0] : null;
  data.files = {
    selectFiles: filePickerData.selectFiles.length ? filePickerData.selectFiles : data.image && data.image.url ? [data.image] : []
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

  return Fliplet.Widget.save(data).then(function() {
    if (notifyComplete) {
      Fliplet.Widget.complete();
      Fliplet.Studio.emit('reload-page-preview');
    } else {
      Fliplet.Studio.emit('reload-widget-instance', widgetId);
    }
  });
}

init();
