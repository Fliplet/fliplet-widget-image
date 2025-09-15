Fliplet.Widget.instance({
  name: 'image-2-0-0',
  render: {
    ready: async function() {
      const image = this;
      const imageInstanceId = image.id;
      const $imageContainer = $(image.$el);

      let parents = [];

      try {
        parents = await Fliplet.Widget.findParents({
          instanceId: imageInstanceId
        });
      } catch (error) {
        console.error('Failed to find parent widgets', error);

        return;
      }

      /**
       * Finds and returns the parent widget and its entry data for a specified widget type.
       * @param {'RecordContainer'|'ListRepeater'|'DynamicContainer'} type - The type of parent widget to search for.
       * @param {string} packageName - The package name of the parent widget.
       * @returns {Promise<[Object|null, Object|null]>} A promise that resolves to a tuple: [parent widget configuration or null, parent widget instance or null].
       * @async
       * @private
       */
      const findParentDataWidget = async(type, packageName) => {
        try {
          const parent = parents.find((parent) => parent.package === packageName);

          if (!parent) {
            return [null, null];
          }

          const instance = await Fliplet[type].get({ id: parent.id });

          return [parent, instance];
        } catch (error) {
          console.error('Failed to fetch parent widget instance', error);

          return [null, null];
        }
      };

      const [[ dynamicContainer ], [ recordContainer, recordContainerInstance ], [ listRepeater, listRepeaterInstance ]] = await Promise.all([
        findParentDataWidget('DynamicContainer', 'com.fliplet.dynamic-container'),
        findParentDataWidget('RecordContainer', 'com.fliplet.record-container'),
        findParentDataWidget('ListRepeater', 'com.fliplet.list-repeater')
      ]);

      function errorMessageStructureNotValid(message) {
        Fliplet.UI.Toast(message);
      }

      if (!dynamicContainer || !dynamicContainer.dataSourceId) {
        return errorMessageStructureNotValid('This component needs to be placed inside a Data Container and select a data source');
      }

      if (!recordContainer && !listRepeater) {
        return errorMessageStructureNotValid('This component needs to be placed inside a Record or Data list component');
      }

      let ENTRY = null;

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

      let entryData = {};


      if (recordContainerInstance) {
        if (Fliplet.Env.get('mode') === 'interact') {
          imageOptions.showPlaceholder = true;

          return renderImage();
        }

        ENTRY = recordContainerInstance.entry;
      } else if (listRepeaterInstance) {
        const closestListRepeaterRow = image.parents().find(parent => parent.element.nodeName.toLowerCase() === 'fl-list-repeater-row');

        if (Fliplet.Env.get('mode') === 'interact') {
          imageOptions.showPlaceholder = true;

          return renderImage();
        }

        if (closestListRepeaterRow) {
          ENTRY = closestListRepeaterRow.entry;
        }
      }

      if (!ENTRY) {
        console.warn('No entry found');

        return;
      }

      entryData = ENTRY.data || {};

      function renderImage() {
        return new Promise((resolve) => {
          let imageColumnUrlValue;

          if (entryData) {
            imageColumnUrlValue = entryData[imageOptions.imageColumnName];
          }


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


      if (!imageOptions.imageColumnName) {
        imageOptions.showPlaceholder = true;

        return renderImage();
      }

      return renderImage();
    }
  }
});
