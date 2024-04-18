Fliplet.Widget.instance({
  name: 'image-component',
  displayName: 'Image component',
  render: {
    template: [
      '<span class="image-component-container"></span>'
    ].join(''),
    ready: async function() {
      const image = this;
      const entryData = image?.parent?.entry?.data || {};
      const imageInstanceId = image.id;
      const $imageContainer = $(image.$el).find('.image-component-container');

      image.fields = _.assign(
        {
          showIfImageNotFound: 'Placeholder',
          imageColumnName: ''
        },
        image.fields
      );

      let imageOptions = {
        showPlaceholder: false,
        url: null,
        alt: 'Image placeholder',
        imageColumnName: image.fields.imageColumnName,
        showIfImageNotFound: image.fields.showIfImageNotFound,
        placeholderPath: Fliplet.Widget.getAsset(imageInstanceId, 'img/placeholder.jpg')
      };

      if (Fliplet.Env.get('interface') || Fliplet.Env.get('mode') === 'interact' || !imageOptions.imageColumnName) {
        imageOptions.showPlaceholder = true;

        return renderImage();
      }

      Fliplet.Widget.findParents({ instanceId: imageInstanceId }).then(function(widgets) {
        const dynamicContainer = widgets.find(widget => widget.package === 'com.fliplet.dynamic-container');

        if (!dynamicContainer) {
          return;
        }

        const recordContainer = widgets.find(widget => widget.package === 'com.fliplet.record-container');
        const listRepeater = widgets.find(widget => widget.package === 'com.fliplet.list-repeater');

        if (!recordContainer && !listRepeater) {
          return;
        }

        renderImage();
      });

      function renderImage() {
        const imageColumnUrlValue = entryData[imageOptions.imageColumnName];

        if (imageOptions.showPlaceholder) {
          imageOptions.url = imageOptions.placeholderPath;
        } else if (imageColumnUrlValue?.length) {
          if (Array.isArray(imageColumnUrlValue)) {
            imageOptions.url = imageColumnUrlValue[0];
          } else {
            imageOptions.url = imageColumnUrlValue;
          }

          imageOptions.alt = 'Image component';
        } else if (imageOptions.showIfImageNotFound === 'Placeholder') {
          imageOptions.url = imageOptions.placeholderPath;
        } else {
          return; // Exit early if image doesn't exist and placeholder shouldn't be shown
        }

        $imageContainer.html(`<img data-image-id="${imageInstanceId}" src="${imageOptions.url}" alt="${imageOptions.alt}" />`);
      }
    }
  }
});
