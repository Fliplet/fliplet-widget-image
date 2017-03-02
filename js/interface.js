var data = Fliplet.Widget.getData() || {};

var SELECTOR = {
  IMAGE_PREVIWER: '.image-previewer',
  IMAGE_EDITOR: '.image-editor',
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
  BTN_EDIT_ROTATE_CANCEL: '#cancelRotate'
};

var EDITOR_MODE = {
  MAIN: 'main',
  CROP: 'crop',
  RESIZE: 'resize',
  ROTATE: 'rotate'
};

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
  if (data.image && data.image.size) {
    data.image.width = data.image.size[0];
    data.image.height = data.image.size[1];
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


// Temporary alerts for Beta
$('#help_tip').on('click', function() {
  alert("During beta, please use live chat and let us know what you need help with.");
});

//Edit
function showEdit(){
  $(SELECTOR.IMAGE_PREVIWER).hide();
  $(SELECTOR.IMAGE_EDITOR).show();
}

function saveEdit(){
  closeEdit();
}

function closeEdit(){
  $(SELECTOR.IMAGE_EDITOR).hide();
  $(SELECTOR.IMAGE_PREVIWER).show();
}

//Crop
function showCrop(){
  swithEditorMode(EDITOR_MODE.CROP);
}

function applyCrop(){
  closeCrop();
}

function closeCrop(){
  swithEditorMode(EDITOR_MODE.MAIN);
}

//Resize
function showResize(){
  swithEditorMode(EDITOR_MODE.RESIZE);
}

function applyResize(){
  closeResize();
}

function closeResize(){
  swithEditorMode(EDITOR_MODE.MAIN);
}

//Rotate
function showRotate(){
  swithEditorMode(EDITOR_MODE.ROTATE);
}

function applyRotate(){
  closeRotate();
}

function closeRotate(){
  swithEditorMode(EDITOR_MODE.MAIN);
}

function swithEditorMode(mode){
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