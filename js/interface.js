var data = Fliplet.Widget.getData() || {};

var SELECTOR = {
  IMAGE_PREVIWER: '.image-previewer',
  IMAGE_EDITOR: '.image-editor',
  IMAGE_PREVIEWER_CANVAS_WRAPPER: '#preview-image-editor',
  IMAGE_EDITOR_MAIN: '.image-editor-main',
  IMAGE_EDITOR_CROP: '.image-editor-crop',
  IMAGE_EDITOR_RESIZE: '.image-editor-resize',
  IMAGE_EDITOR_ROTATE: '.image-editor-rotate',
  BTN_EDIT_SHOW: '#showEditButton',
  BTN_EDIT_SAVE_CHANGES: '#saveEditChangesButton',
  BTN_EDIT_CLOSE: '#closeEditButton',
  BTN_EDIT_CROP_SHOW: '#cropEditButton',
  BTN_EDIT_CROP_APPLY: '#applyCrop',
  BTN_EDIT_CROP_CANCEL: '#cancelCrop',
  BTN_EDIT_RESIZE_SHOW: '#resizeEditButton',
  BTN_EDIT_RESIZE_APPLY: '#applyResize',
  BTN_EDIT_RESIZE_CANCEL: '#cancelResize',
  BTN_EDIT_ROTATE_SHOW: '#rotateEditButton',
  BTN_EDIT_ROTATE_APPLY: '#applyRotate',
  BTN_EDIT_ROTATE_CANCEL: '#cancelRotate',
  CANVAS_EDITOR: '#canvasEditor',
  CANVAS_SOURCE: '#canvasSource',
  BTN_EDIT_ROTATE_LEFT: '#rotateLeft',
  BTN_EDIT_ROTATE_RIGHT: '#rotateRight',
  INPUT_EDIT_RESIZE_WIDTH: '#width',
  INPUT_EDIT_RESIZE_HEIGHT: '#height',
  INPUT_EDIT_RESIZE_LOCK_RATIO: '#lock-ratio',
  DIV_EDIT_RESIZE_RATIO_DANGER: '.bg-danger',
  DIV_EDIT_CORP_CONTAINER: '',
  INPUT_EDIT_CROP_X: '#crop_x',
  INPUT_EDIT_CROP_Y: '#crop_y',
  INPUT_EDIT_CROP_W: '#crop_w',
  INPUT_EDIT_CROP_H: '#crop_h',
  SELECT_EDIT_ASPECT_RATIO: '#aspectRatio',
  DIV_PULL_RIGHT: '.pull-right',
  DIV_EDIT_CROP_COORDS_FORM: '#coordsForm',
  LOADER: '#loader',
  EDIT_CANVAS_WRAPPER: '#editCanvasWrapper'
};

var EDITOR_MODE = {
  MAIN: 'main',
  CROP: 'crop',
  RESIZE: 'resize',
  ROTATE: 'rotate'
};

var canvasEditor;

var linkActionProvider;

// Load interface data
if (data.action && data.action.action === 'gallery') {
  $('#pinch').prop('checked', true);
}

// Load link data
if (data.action && data.action.action !== 'gallery') {
  initLinkProvider(data.action);
  $('.link-actions').addClass('show');
  $('#link').prop('checked', true);
}

//mehtod used to init the link provider
function initLinkProvider(linkAction) {
  linkActionProvider = Fliplet.Widget.open('com.fliplet.link', {
    selector: '.link-actions',
    data: linkAction,
    onEvent: function (event, data) {
      if (event === 'interface-validate') {
        Fliplet.Widget.toggleSaveButton(data.isValid === true);
      }
    },
    closeOnSave: false
  });
  linkActionProvider.then(function (result) {
    data.action = result.data;
  });
}

function save(notifyComplete) {
  Fliplet.Widget.save(data).then(function () {
    if (notifyComplete) {
      Fliplet.Widget.complete();
      Fliplet.Studio.emit('reload-page-preview');
    }
  });
}

var imageProvider = Fliplet.Widget.open('com.fliplet.image-manager', {
  selector: "#image-manager",
  single: true,
  type: 'image'
});

imageProvider.then(function (result) {
  data.image = result.data || data.image;
  data.action = data.action || {};
  if (data.image && $('#pinch').is(':checked')) {
    data.action.action = 'gallery';
    data.action.images = [data.image];
  }
  if (data.image && data.image.size) {
    data.image.width = data.image.size[0];
    data.image.height = data.image.size[1];
  }
});

//handle the tap_action change event
$('input[name="tap_action"]').on('change', function () {
  if ($(this).val() === "link") {
    if (!linkActionProvider) {
      initLinkProvider();
    }
    $('.link-actions').addClass('show');
    return;
  }
  $('.link-actions').removeClass('show');
});

// 1. Fired from Fliplet Studio when the external save button is clicked
Fliplet.Widget.onSaveRequest(function () {
  var providersPromises = [imageProvider];
  imageProvider.forwardSaveRequest();
  if (linkActionProvider && !$('#pinch').is(':checked')) {
    providersPromises.push(linkActionProvider);
    linkActionProvider.forwardSaveRequest();
  }
  //when the provider promises are finished save the data.
  Fliplet.Widget.all(providersPromises).then(save);
});

// Temporary alerts for Beta
$('#help_tip').on('click', function () {
  alert("During beta, please use live chat and let us know what you need help with.");
});

// Events
$(SELECTOR.BTN_EDIT_SHOW).on('click', showEdit);

$(SELECTOR.BTN_EDIT_SAVE_CHANGES).on('click', saveEdit);

$(SELECTOR.BTN_EDIT_CLOSE).on('click', closeEdit);

$(SELECTOR.BTN_EDIT_CROP_SHOW).on('click', showCrop);
$(SELECTOR.BTN_EDIT_CROP_APPLY).on('click', applyCrop);
$(SELECTOR.BTN_EDIT_CROP_CANCEL).on('click', closeCrop);

$(SELECTOR.BTN_EDIT_RESIZE_SHOW).on('click', showResize);
$(SELECTOR.BTN_EDIT_RESIZE_APPLY).on('click', applyResize);
$(SELECTOR.BTN_EDIT_RESIZE_CANCEL).on('click', closeResize);

$(SELECTOR.BTN_EDIT_ROTATE_SHOW).on('click', showRotate);
$(SELECTOR.BTN_EDIT_ROTATE_APPLY).on('click', applyRotate);
$(SELECTOR.BTN_EDIT_ROTATE_CANCEL).on('click', closeRotate);

$(SELECTOR.BTN_EDIT_ROTATE_LEFT).on('click', canvasRotateLeft);
$(SELECTOR.BTN_EDIT_ROTATE_RIGHT).on('click', canvasRotateRight);

$(SELECTOR.INPUT_EDIT_RESIZE_WIDTH).on('input', widthChangedWithoutFocusOut);
$(SELECTOR.INPUT_EDIT_RESIZE_HEIGHT).on('input', heightChangedWithoutFocusOut);

$(SELECTOR.INPUT_EDIT_RESIZE_LOCK_RATIO).on('click', changeLockRatio);

$(SELECTOR.SELECT_EDIT_ASPECT_RATIO).on('change', changeAspectRatio);

$(SELECTOR.INPUT_EDIT_CROP_X).on('change paste keyup', updateCropMask);
$(SELECTOR.INPUT_EDIT_CROP_Y).on('change paste keyup', updateCropMask);
$(SELECTOR.INPUT_EDIT_CROP_W).on('change paste keyup', updateCropMask);
$(SELECTOR.INPUT_EDIT_CROP_H).on('change paste keyup', updateCropMask);

// Temporary alerts for Beta
$('#help_tip').on('click', function () {
  alert("During beta, please use live chat and let us know what you need help with.");
});

//Edit
function showEdit() {
  if (data.image){
    $(SELECTOR.IMAGE_PREVIWER).hide();
    $(SELECTOR.IMAGE_EDITOR).show();

    canvasEditor = new CanvasEditor({
      sourceCanvas : document.createElement("canvas"),
      editorCanvas : document.createElement("canvas"),
      image: data.image,
      isDev: window.location.hostname === 'localhost',
      beforeRenderCallback: showLoader,
      afterRenderCallback: hideLoader
    });

    canvasEditor.init(function() {
      canvasEditor.appendEditorCanvas($(SELECTOR.IMAGE_PREVIEWER_CANVAS_WRAPPER));
    });
  }
}

function showLoader() {
  $(canvasEditor.editorCanvas).hide();
  $(SELECTOR.LOADER).show();
}

function hideLoader() {
  $(SELECTOR.LOADER).hide();
  $(canvasEditor.editorCanvas).show();
}

function saveEdit() {
  showLoader();
  canvasEditor.sourceCanvas.toBlob(function(result) {
    var formData = new FormData();
    var fileName = data.image.name.replace(/\.[^/.]+$/, "");
    formData.append("blob",result, fileName + '.jpeg');
    Fliplet.Media.Files.upload({
      data: formData
    }).then(function (files) {
      data.image = files[0];
      if (data.image && data.image.size) {
        data.image.width = data.image.size[0];
        data.image.height = data.image.size[1];
      }
      save(true);
    })
  }, 'image/jpeg');
}

function closeEdit() {
  changeDimensions(data.image.width, data.image.height);
  $(canvasEditor.sourceCanvas).remove();
  $(canvasEditor.editorCanvas).remove();
  $(SELECTOR.EDIT_CANVAS_WRAPPER).remove();

  $(SELECTOR.IMAGE_EDITOR).hide();
  $(SELECTOR.IMAGE_PREVIWER).show();
}

//Crop
function showCrop() {
  swithEditorMode(EDITOR_MODE.CROP);
  canvasEditor.applyEditorCanvasChanges();
  canvasEditor.createCropMask(updateCropCoords);
  showCustomCropRatio();
}

function showCustomCropRatio() {
  $(SELECTOR.SELECT_EDIT_ASPECT_RATIO).val('custom');
  $(SELECTOR.DIV_EDIT_CROP_COORDS_FORM).css('display', '');
}

function updateCropCoords (coords, proportion) {
  $(SELECTOR.INPUT_EDIT_CROP_X).val(Math.round(coords.x * proportion));
  $(SELECTOR.INPUT_EDIT_CROP_Y).val(Math.round(coords.y * proportion));
  $(SELECTOR.INPUT_EDIT_CROP_W).val(Math.round(coords.w * proportion));
  $(SELECTOR.INPUT_EDIT_CROP_H).val(Math.round(coords.h * proportion));
}

function applyCrop() {
  var x = $(SELECTOR.INPUT_EDIT_CROP_X).val();
  var y = $(SELECTOR.INPUT_EDIT_CROP_Y).val();
  var w = $(SELECTOR.INPUT_EDIT_CROP_W).val();
  var h = $(SELECTOR.INPUT_EDIT_CROP_H).val();

  canvasEditor.cropEditorCanvas(x, y, w, h, afterCropApply);
}

function afterCropApply() {
  canvasEditor.applyEditorCanvasChanges();
  changeDimensions();
  closeCrop();
}

function closeCrop() {
  canvasEditor.destroyCropMask($(SELECTOR.IMAGE_PREVIEWER_CANVAS_WRAPPER));
  canvasEditor.resetEditorCanvas();
  swithEditorMode(EDITOR_MODE.MAIN);
}

function changeAspectRatio() {
  var aspectRatio = $(SELECTOR.SELECT_EDIT_ASPECT_RATIO).val();
  var ratio;
  switch(aspectRatio) {
    case 'original': ratio =  canvasEditor.editorCanvas.width / canvasEditor.editorCanvas.height;
      break;
    case 'smaller': ratio = 4;
      break;
    case 'medium': ratio = 16/9;
      break;
    case 'big': ratio = 4/3;
      break;
    case 'square': ratio = 1;
      break;
    case 'custom':
    default: ratio = 0;
      break;
  }

  if(aspectRatio !== 'custom'){
    $(SELECTOR.DIV_EDIT_CROP_COORDS_FORM).css('display', 'none');
  } else {
    $(SELECTOR.DIV_EDIT_CROP_COORDS_FORM).css('display', '');
  }

  var jcropApi = $(canvasEditor.editorCanvas).parent().data('Jcrop');
  jcropApi.setOptions({
    aspectRatio: ratio
  });

  canvasEditor.resetCropMaskToDefault();
 }

function updateCropMask(){
  var x = parseInt($(SELECTOR.INPUT_EDIT_CROP_X).val());
  var y = parseInt($(SELECTOR.INPUT_EDIT_CROP_Y).val());
  var w = parseInt($(SELECTOR.INPUT_EDIT_CROP_W).val());
  var h = parseInt($(SELECTOR.INPUT_EDIT_CROP_H).val());
  canvasEditor.updateCropMask(x, y, w, h);
}

//Resize
function showResize() {
  $(SELECTOR.INPUT_EDIT_RESIZE_WIDTH).val(canvasEditor.sourceCanvas.width);
  $(SELECTOR.INPUT_EDIT_RESIZE_HEIGHT).val(canvasEditor.sourceCanvas.height);
  swithEditorMode(EDITOR_MODE.RESIZE);
}

function applyResize() {
  canvasEditor.applyEditorCanvasChanges();

  changeDimensions();
  hideResize();
}

function widthChanged() {
  var ratio = canvasEditor.editorCanvas.height / canvasEditor.editorCanvas.width;
  var width = parseInt($(SELECTOR.INPUT_EDIT_RESIZE_WIDTH).val());
  var height = parseInt($(SELECTOR.INPUT_EDIT_RESIZE_HEIGHT).val());
  if ($(SELECTOR.INPUT_EDIT_RESIZE_LOCK_RATIO).prop('checked')) {
    height =  Math.round(width * ratio);
    if (height < 1) height = 1;
    $(SELECTOR.INPUT_EDIT_RESIZE_HEIGHT).val(height);
  }

  canvasEditor.resizeEditorCanvas(width, height);
}

function heightChanged() {
  var ratio =  canvasEditor.editorCanvas.width / canvasEditor.editorCanvas.height;
  var width = parseInt($(SELECTOR.INPUT_EDIT_RESIZE_WIDTH).val());
  var height = parseInt($(SELECTOR.INPUT_EDIT_RESIZE_HEIGHT).val());
  if ($(SELECTOR.INPUT_EDIT_RESIZE_LOCK_RATIO).prop('checked')) {
    width = Math.round(height * ratio);
    if (width < 1) width = 1;
    $(SELECTOR.INPUT_EDIT_RESIZE_WIDTH).val(width);
  }

  canvasEditor.resizeEditorCanvas(width, height);
}

var sizeChangedTimeout = null;

function createSizeChangedTimeout(callback) {
  if(sizeChangedTimeout) {
    clearTimeout(sizeChangedTimeout);
    sizeChangedTimeout = null;
  }
  sizeChangedTimeout = setTimeout(function() {
    callback()
  }, 350);
}

function widthChangedWithoutFocusOut(e) {
  var currentWidth = Math.round(+e.target.value) || canvasEditor.currentImage.width;
  if(currentWidth !== Math.round(+e.target.value)) {
    $(SELECTOR.INPUT_EDIT_RESIZE_WIDTH).val(currentWidth);
  }
  createSizeChangedTimeout(widthChanged);
}

function heightChangedWithoutFocusOut(e) {
  var currentHeight = Math.round(+e.target.value) || canvasEditor.currentImage.height;
  if(currentHeight !== Math.round(+e.target.value)) {
    $(SELECTOR.INPUT_EDIT_RESIZE_HEIGHT).val(currentHeight);
  }
  createSizeChangedTimeout(heightChanged);
}

function changeLockRatio() {
  if ($(SELECTOR.INPUT_EDIT_RESIZE_LOCK_RATIO).prop('checked')) {
    $(SELECTOR.DIV_EDIT_RESIZE_RATIO_DANGER).hide();
    widthChanged();
  } else {
    $(SELECTOR.DIV_EDIT_RESIZE_RATIO_DANGER).show();
  }
}

function closeResize() {
  canvasEditor.resetEditorCanvas();
  hideResize();
}

function hideResize(){
  swithEditorMode(EDITOR_MODE.MAIN);
}

//Rotate
function showRotate() {
  swithEditorMode(EDITOR_MODE.ROTATE);
}


function applyRotate() {
  canvasEditor.applyEditorCanvasChanges();

  changeDimensions();
  hideRotate();
}

function closeRotate() {
  canvasEditor.resetEditorCanvas();
  hideRotate();
}

function hideRotate() {
  swithEditorMode(EDITOR_MODE.MAIN);
}

function canvasRotateLeft() {
  canvasEditor.rotateEditorCanvas(-90);
}

function canvasRotateRight() {
  canvasEditor.rotateEditorCanvas(90);
}

function changeDimensions(width, height) {
  $(SELECTOR.DIV_PULL_RIGHT)
  .empty();
  $(SELECTOR.DIV_PULL_RIGHT)
  .append((width ? width : canvasEditor.sourceCanvas.width) +
    'x' + (height ? height : canvasEditor.sourceCanvas.height));
}


function swithEditorMode(mode) {
  $(SELECTOR.IMAGE_EDITOR_MAIN).hide();
  $(SELECTOR.IMAGE_EDITOR_CROP).hide();
  $(SELECTOR.IMAGE_EDITOR_RESIZE).hide();
  $(SELECTOR.IMAGE_EDITOR_ROTATE).hide();

  var selector = '';
  switch (mode) {
    case EDITOR_MODE.CROP:
      selector = SELECTOR.IMAGE_EDITOR_CROP;
      break;
    case EDITOR_MODE.RESIZE:
      selector = SELECTOR.IMAGE_EDITOR_RESIZE;
      break;
    case EDITOR_MODE.ROTATE:
      selector = SELECTOR.IMAGE_EDITOR_ROTATE;
      break;
    default:
      selector = SELECTOR.IMAGE_EDITOR_MAIN;
  }

  $(selector).show();
}