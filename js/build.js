Fliplet.Widget.instance({
  name: 'image-component',
  displayName: 'Image component',
  render: {
    template: [
      '<span class="image-component-container"></span>'
    ].join(''),
    ready: async function() {
      const imageComponent = this;
      const currentEntry = imageComponent.parent.entry;
      const imageComponentInstanceId = imageComponent.id;
      const placeholderPath = Fliplet.Widget.getAsset(imageComponentInstanceId, 'img/placeholder.jpg');
      const $imageContainer = $(imageComponent.$el).find('.image-component-container');

      let selectedImageColumn = null;
      let showIfImageNotFound = null;

      if (Fliplet.Env.get('interface') || Fliplet.Env.get('mode') === 'interact') {
        return renderImage(true);
      }

      Fliplet.Widget.findParents({ instanceId: imageComponentInstanceId }).then(function(widgets) {
        const dynamicContainer = widgets.find(widget => widget.package === 'com.fliplet.dynamic-container');

        if (!dynamicContainer) {
          return;
        }

        const recordContainer = widgets.find(widget => widget.package === 'com.fliplet.record-container');
        const listRepeater = widgets.find(widget => widget.package === 'com.fliplet.repeater');

        if (!recordContainer && !listRepeater) {
          return;
        }

        imageComponent.fields = _.assign(
          {
            showIfImageNotFound: 'Placeholder',
            imageColumn: ''
          },
          imageComponent.fields
        );

        selectedImageColumn = imageComponent.fields.imageColumn;
        showIfImageNotFound = imageComponent.fields.showIfImageNotFound;

        if (!selectedImageColumn) {
          return; // TODO render placeholder, show image, or nothing?
          // return renderImage(true);
        }

        // renderImage(!selectedImageColumn); // TODO
        renderImage();
      });

      function renderImage(notPreview = false) {
        const image = { url: '', alt: 'Image placeholder' };
        let imageColumnValue = currentEntry.data[selectedImageColumn];

        if (notPreview) {
          image.url = placeholderPath;
        } else if (imageColumnValue && imageColumnValue.length) {
          if (Array.isArray(imageColumnValue)) {
            image.url = imageColumnValue[0];
          } else {
            image.url = imageColumnValue;
          }

          image.alt = 'Image component';
        } else if (showIfImageNotFound === 'Placeholder') {
          image.url = placeholderPath;
        } else {
          return; // Exit early if image doesn't exist and placeholder shouldn't be shown
        }

        $imageContainer.html(`<img data-image-id="${imageComponentInstanceId}" src="${image.url}" alt="${image.alt}" />`);
      }
    }
  }
});
