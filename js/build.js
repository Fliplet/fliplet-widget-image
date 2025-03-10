Fliplet.Widget.instance({
  name: 'image-2-0-0',
  render: {
    ready: async function() {
      const image = this;
      const imageInstanceId = image.id;
      const $imageContainer = $(image.$el);

      const parents = await Fliplet.Widget.findParents({
        instanceId: imageInstanceId
      });

      /**
       * Finds and returns the parent widget and its entry data for a specified widget type
       * @param {('RecordContainer'|'ListRepeater'|'DynamicContainer')} type - The type of parent widget to search for
       * @returns {Promise<[Object|null, Object|null]>} A tuple containing:
       *   - The parent widget configuration if found, null otherwise
       *   - The parent widget instance if found, null otherwise
       * @async
       * @private
       */
      const findParentDataWidget = async (type, packageName) => {
        const parent = parents.find((parent) => parent.package === packageName);

        if (!parent) {
          return [null, null];
        }

        const instance = await Fliplet[type].get({ id: parent.id });
        return [parent, instance];
      }

      const [[ dynamicContainer ], [ recordContainer, recordContainerInstance ], [ listRepeater, listRepeaterInstance ]] = await Promise.all([
        findParentDataWidget('DynamicContainer', 'com.fliplet.dynamic-container'),
        findParentDataWidget('RecordContainer', 'com.fliplet.record-container'),
        findParentDataWidget('ListRepeater', 'com.fliplet.list-repeater')
      ]);

      let ENTRY = null;

      if (recordContainerInstance) {
        ENTRY = recordContainerInstance.entry;
      } else if (listRepeaterInstance) {
        const closestListRepeaterRow = image.parents().find(parent => parent.element.nodeName.toLowerCase() === 'fl-list-repeater-row');
        if (closestListRepeaterRow) {
          ENTRY = closestListRepeaterRow.entry;
        }
      }

      if (!ENTRY) {
        console.error('No entry found');
        return;
      }

      const entryData = ENTRY.data || {};

      function renderImage() {
        return new Promise((resolve) => {
          const imageColumnUrlValue = entryData[imageOptions.imageColumnName];
          
          // Set alt text based on configuration or data
          if (imageOptions.showPlaceholder) {
            imageOptions.url = imageOptions.placeholderPath;
            imageOptions.alt = imageOptions.placeholderAltText || 'Placeholder image';
          } else if (imageColumnUrlValue?.length) {
            if (Array.isArray(imageColumnUrlValue)) {
              imageOptions.url = imageColumnUrlValue[0];
            } else {
              imageOptions.url = imageColumnUrlValue;
            }

            // Use alt text from data source if available, fallback to configured alt text
            imageOptions.alt = entryData[imageOptions.altTextColumnName] || imageOptions.configuredAltText || 'Image';
          } else if (imageOptions.showIfImageNotFound === 'placeholder') {
            imageOptions.url = imageOptions.placeholderPath;
            imageOptions.alt = imageOptions.placeholderAltText || 'Placeholder image';
          } else {
            return; // Exit early if image doesn't exist and placeholder shouldn't be shown
          }

          let img = new Image();

          img.loading = 'lazy';
          img.alt = imageOptions.alt;
          
          // Add ARIA attributes for better accessibility
          if (imageOptions.decorative) {
            img.setAttribute('role', 'presentation');
            img.alt = ''; // Empty alt for decorative images
          } else {
            img.setAttribute('role', 'img');
          }

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

          // Add wrapper div for better accessibility if image has a caption
          if (imageOptions.caption) {
            const figure = document.createElement('figure');
            const figcaption = document.createElement('figcaption');
            figcaption.textContent = imageOptions.caption;
            figure.appendChild(img);
            figure.appendChild(figcaption);
            $imageContainer.html(figure);
          } else {
            $imageContainer.html(img);
          }
        });
      }

      image.fields = _.assign(
        {
          showIfImageNotFound: 'placeholder',
          imageColumnName: '',
          altTextColumnName: '', // New field for alt text column
          configuredAltText: 'Image', // New field for configured alt text
          placeholderAltText: 'Placeholder image', // New field for placeholder alt text
          decorative: false, // New field to mark image as decorative
          caption: '' // New field for image caption
        },
        image.fields
      );

      let imageOptions = {
        showPlaceholder: false,
        url: null,
        alt: image.fields.configuredAltText || 'Image',
        imageColumnName: image.fields.imageColumnName,
        altTextColumnName: image.fields.altTextColumnName,
        showIfImageNotFound: image.fields.showIfImageNotFound,
        placeholderPath: Fliplet.Widget.getAsset(imageInstanceId, 'img/placeholder.png'),
        placeholderAltText: image.fields.placeholderAltText,
        configuredAltText: image.fields.configuredAltText,
        decorative: image.fields.decorative,
        caption: image.fields.caption
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

      if (!dynamicContainer || !dynamicContainer.dataSourceId) {
        if (!dynamicContainer) {
          return errorMessageStructureNotValid($(image.$el), 'This component needs to be placed inside a Dynamic Container and select a data source');
        } else if (!dynamicContainer.dataSourceId) {
          return Fliplet.UI.Toast('Please select a valid data source.');
        }
      }

      if (!recordContainer && !listRepeater) {
        return errorMessageStructureNotValid($(image.$el), 'This component needs to be placed inside a Record container or List Repeater component');
      }

      return renderImage();
    }
  }
});
