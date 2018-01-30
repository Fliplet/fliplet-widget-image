var widgetId = Fliplet.Widget.getDefaultId();
var widgetData = Fliplet.Widget.getData() || {};

var filePickerProvider;
var imageEditorProvider;
var linkActionProvider;

var filePickerData;

function init() {
  filePickerInit();
  imageEditorInit();

  // Load link action
  if (widgetData.action && widgetData.action.action === 'gallery') {
    $('#pinch').prop('checked', true);
  }

  if (widgetData.action && widgetData.action.action !== 'gallery') {
    linkProviderInit(widgetData.action);
    $('.link-actions').addClass('show');
    $('#link').prop('checked', true);
  }

  if (!widgetData.action) {
    $('#none').prop('checked', true);
  }

  if (widgetData.lazyLoad) {
    $('#lazyload_yes').prop('checked', true);
  } else {
    $('#lazyload_no').prop('checked', true);
  }

  attahObservers();
}

function forwardSaveRequestFilePicker() {
  if (filePickerProvider) {
    return filePickerProvider.forwardSaveRequest();
  }

  save(true);
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
      return linkActionProvider.forwardSaveRequest();
    } else {
      forwardSaveRequestFilePicker();
    }
  });
}

function filePickerDataInit() {
  filePickerData = {
    selectFiles: widgetData.image ? [widgetData.image] : [],
    selectMultiple: false,
    type: 'image',
    fileExtension: ['JPG', 'JPEG', 'PNG', 'GIF', 'TIFF'],
    autoSelectOnUpload: true
  };
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
          oldSelectedFileId = filePickerData.selectFiles.length ? filePickerData.selectFiles[0].id :
            (widgetData.image) ? widgetData.image.id : '';
          filePickerData.selectFiles = data.length ? data : [];
          if (data.length) {
            save();
            if (oldSelectedFileId !== data[0].id) {
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
    filePickerData.selectFiles = data.data.length ? data.data : [];
    save(true);
  });
}

function imageEditorInit() {
  if (!widgetData.image) {
    return;
  }

  if (imageEditorProvider) {
    imageEditorProvider = null;
    $('.image-editor-holder').html('');
  }
  imageEditorProvider = Fliplet.Widget.open('com.fliplet.image-editor', {
    selector: '.image-editor-holder',
    data: {
      image: widgetData.image
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
    widgetData.action = result.data;
    forwardSaveRequestFilePicker();
  });
}

function save(notifyComplete) {
  widgetData.image = (filePickerData.selectFiles.length && filePickerData.selectFiles[0].url) ? filePickerData.selectFiles[0] : null;

  if (widgetData.image && widgetData.image.size) {
    widgetData.image.width = widgetData.image.size[0];
    widgetData.image.height = widgetData.image.size[1];
  }

  if (widgetData.image && $('#pinch').is(':checked')) {
    widgetData.action = {};
    widgetData.action.action = 'gallery';
    widgetData.action.images = [widgetData.image];
  }

  if (widgetData.image) {
    $('.nav-tabs li').removeClass('disabled');
  }

  if ($('#none').is(':checked') && widgetData.action) {
    widgetData.action = null;
  }

  var lazyLoadValue = $('[name="enable_lazyload"]:checked').val();
  if (lazyLoadValue === 'yes') {
    widgetData.lazyLoad = true;
  } else {
    widgetData.lazyLoad = false;
  }

  return Fliplet.Widget.save(widgetData).then(function() {
    if (notifyComplete) {
      Fliplet.Widget.complete();
      Fliplet.Studio.emit('reload-page-preview');
    } else {
      Fliplet.Studio.emit('reload-widget-instance', widgetId);
    }
  });
}

init();
