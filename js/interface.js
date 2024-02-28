var widgetId = Fliplet.Widget.getDefaultId();
var widgetData = Fliplet.Widget.getData() || {};
var page = Fliplet.Widget.getPage();

var filePickerProvider;
var imageEditorProvider;
var linkActionProvider;

var filePickerData;
var resetData = widgetData.image ? [widgetData.image] : [];
var omitPages = page ? [page.id] : [];

function init() {
  filePickerInit();
  Fliplet.Widget.toggleCancelButton(false);

  // Load link action
  if (widgetData.action && widgetData.action.action === 'gallery') {
    $('#pinch').prop('checked', true);
  }

  if (widgetData.action && widgetData.action.action !== 'gallery') {
    widgetData.action.omitPages = omitPages;
    linkProviderInit(widgetData.action);
    $('.link-actions').addClass('show');
    $('#link').prop('checked', true);
  }

  if (!widgetData.action) {
    $('#none').prop('checked', true);
  }

  $('#activate_lazyload').prop('checked', !!widgetData.lazyLoad);

  if (widgetData.fullScreen) {
    $('#fullscreen').prop('checked', true);
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
    if ($(this).val() === 'link' && $(this).is(':checked')) {
      if (!linkActionProvider) {
        linkProviderInit({ omitPages: omitPages });
      }

      $('.link-actions').addClass('show');

      return;
    }

    $('.link-actions').removeClass('show');
    save();
  });

  $('.nav-tabs [data-toggle="tab"]').on('shown.bs.tab', function(e) {
    var tab = $(e.target).attr('href');

    if (tab === '#image-editor') {
      imageEditorInit();
    }
  });

  $('#image-description').on('input', function(e) {
    widgetData.image.description = e.target.value;
    save();
  });

  // 1. Fired from Fliplet Studio when the external save button is clicked
  Fliplet.Widget.onSaveRequest(function() {
    Fliplet.Widget.toggleSaveButton(false);

    if (linkActionProvider && !$('#pinch').is(':checked') && !$('#none').is(':checked')) {
      return linkActionProvider.forwardSaveRequest();
    }

    forwardSaveRequestFilePicker();

    Fliplet.Widget.complete();
  });

  Fliplet.Widget.onCancelRequest(function() {
    filePickerData.selectFiles = resetData;

    save(true);
    Fliplet.Widget.complete();
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
  filePickerData.filePickerOpenFromImage = true;

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
          var oldSelectedFileId = filePickerData.selectFiles.length ? filePickerData.selectFiles[0].id :
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
    $('.image-editor-loading').addClass('animated');
  }

  imageEditorProvider = Fliplet.Widget.open('com.fliplet.image-editor', {
    selector: '.image-editor-holder',
    data: {
      image: widgetData.image
    },
    onEvent: function(e) {
      switch (e) {
        case 'widget-rendered':
          $('.image-editor-loading').removeClass('animated');
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

// method used to init the link provider
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

  if (widgetData.image && !widgetData.image.description) {
    widgetData.image.description = $('#image-description').val();
  }

  if ($('#none').is(':checked') && widgetData.action) {
    widgetData.action = null;
  }

  var lazyLoadValue = $('#activate_lazyload').is(':checked');

  widgetData.lazyLoad = lazyLoadValue;

  if ($('#fullscreen').is(':checked') && $('input[name="tap_action"]:checked').val() === 'fullscreen') {
    widgetData.fullScreen = true;
  } else {
    widgetData.fullScreen = false;
  }

  return Fliplet.Widget.save(widgetData).then(function() {
    if (notifyComplete) {
      Fliplet.Widget.complete();
    } else {
      Fliplet.Studio.emit('reload-widget-instance', widgetId);
    }
  });
}

init();
