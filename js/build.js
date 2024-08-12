Fliplet.Widget.instance({
  name: 'image-2-0-0',
  render: {
    ready: function() {
      const image = this;
      const entryData = image?.parent?.entry?.data || {};
      const imageInstanceId = image.id;
      const $imageContainer = $(image.$el);

      function renderImage() {
        return new Promise((resolve) => {
          const imageColumnUrlValue = entryData[imageOptions.imageColumnName];

          if (imageOptions.showPlaceholder) {
            imageOptions.url = imageOptions.placeholderPath;
          } else if (imageColumnUrlValue?.length) {
            if (Array.isArray(imageColumnUrlValue)) {
              imageOptions.url = imageColumnUrlValue[0];
            } else {
              imageOptions.url = imageColumnUrlValue;
            }

            imageOptions.alt = 'Image';
          } else if (imageOptions.showIfImageNotFound === 'placeholder') {
            imageOptions.url = imageOptions.placeholderPath;
          } else {
            return; // Exit early if image doesn't exist and placeholder shouldn't be shown
          }

          let img = new Image();

          img.loading = 'lazy';
          img.alt = imageOptions.alt;

          // Show placeholder or hide the image if it fails to load
          img.onerror = function() {
            if (imageOptions.showIfImageNotFound === 'placeholder') {
              imageOptions.showPlaceholder = true;

              renderImage().then(resolve);

              return;
            }

            $imageContainer.html('');
            resolve();
          };

          img.onload = resolve;

          // Authenticate the image URL
          img.src = Fliplet.Media.authenticate(imageOptions.url);

          $imageContainer.html(img);
        });
      }

      image.fields = _.assign(
        {
          showIfImageNotFound: 'placeholder',
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
        placeholderPath: Fliplet.Widget.getAsset(imageInstanceId, 'img/placeholder.png')
      };

      if (Fliplet.Env.get('mode') === 'interact' || !imageOptions.imageColumnName) {
        imageOptions.showPlaceholder = true;

        return renderImage();
      }

      // TODO remove after product solution is implemented
      function errorMessageStructureNotValid($element, message) {
        $element.addClass('component-error-before-xxx');
        Fliplet.UI.Toast(message);
      }

      return Fliplet.Widget.findParents({ instanceId: imageInstanceId }).then(function(widgets) {
        let dynamicContainer = null;
        let recordContainer = null;
        let listRepeater = null;

        widgets.forEach(widget => {
          if (widget.package === 'com.fliplet.dynamic-container') {
            dynamicContainer = widget;
          } else if (widget.package === 'com.fliplet.record-container') {
            recordContainer = widget;
          } else if (widget.package === 'com.fliplet.list-repeater') {
            listRepeater = widget;
          }
        });

        if (!dynamicContainer || !dynamicContainer.dataSourceId || (!recordContainer && !listRepeater)) {
          if (!dynamicContainer || !dynamicContainer.dataSourceId) {
            return errorMessageStructureNotValid($(image.$el), 'This component needs to be placed inside a Dynamic Container and select a data source');
          }

          return errorMessageStructureNotValid($(image.$el), 'This component needs to be placed inside a Record container or List Repeater component');
        }

        return renderImage();
      });
    }
  }
});
