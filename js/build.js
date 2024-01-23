// Register this widget instance
Fliplet.Widget.instance({
  name: 'image-component',
  displayName: 'Image component',
  render: {
    template: [
      '<span class="image-component-container"></span>'
    ].join(''),
    ready: async function() {
      // todo remove
      // ---------------------------------------------------------------------------------------
      // await Fliplet.Widget.initializeChildren(this.$el, this);

      // var src = 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQ_13AsYQmPk9sRrdCs7Wr46-fpEJ3tY0GrHMiw-aEkNkGnW8hw';

      // $(this.$el).find('.image-component-container').html(`<img data-image-id="1" src="${src}" alt="Image component" />`);

      // var x = 1;
      // var y = 1;

      // if (x === y) {
      //   return Promise.resolve('');
      // }
      // ---------------------------------------------------------------------------------------

      if (Fliplet.Env.get('interface')) {
        return;
      }

      const imageComponent = this;
      const currentEntry = imageComponent.parent.entry;
      // const instanceId = Fliplet.Widget.getDefaultId();
      const imageComponentInstanceId = imageComponent.id;
      const placeholderPath = Fliplet.Widget.getAsset(imageComponentInstanceId, 'img/placeholder.jpg');
      const $imageContainer = $(imageComponent.$el).find('.image-component-container');

      let selectedImageColumn = null;
      let showIfImageNotFound = null;

      // TODO uncomment
      // Fliplet.Widget.findParents({ instanceId: imageComponentInstanceId }).then(function(widgets) {
      //   const dynamicContainer = widgets.find(widget => widget.package === 'com.fliplet.dynamic-container');

      //   if (!dynamicContainer) {
      //     return;
      //   }

      //   const recordContainer = widgets.find(widget => widget.package === 'com.fliplet.record-container');
      //   const listRepeater = widgets.find(widget => widget.package === 'com.fliplet.repeater');

      //   if (!recordContainer && !listRepeater) {
      //     return;
      //   }

      imageComponent.fields = _.assign(
        {
          showIfImageNotFound: 'Placeholder',
          imageColumn: ''
        },
        imageComponent.fields
      );

      // selectedImageColumn = 'Link'; // imageComponent.fields.imageColumn; // TODO uncomment
      selectedImageColumn = imageComponent.fields.imageColumn; // TODO uncomment
      showIfImageNotFound = imageComponent.fields.showIfImageNotFound;

      if (!selectedImageColumn) {
        return;
      }

      renderImage();
      // });

      function renderImage() {
        let imageColumnValue = currentEntry.data[selectedImageColumn];
        let finalImage = '';

        if (imageColumnValue && Array.isArray(imageColumnValue) && imageColumnValue.length) {
          finalImage = `<img data-image-id="${imageComponentInstanceId}" src="${imageColumnValue[0]}" alt="Image component" />`;
        } else if (imageColumnValue) {
          finalImage = `<img data-image-id="${imageComponentInstanceId}" src="${imageColumnValue}" alt="Image component" />`;
        } else if (showIfImageNotFound === 'Placeholder') {
          finalImage = `<img data-image-id="${imageComponentInstanceId}" src="${placeholderPath}" alt="Image placeholder" />`;
        }

        $imageContainer.html(finalImage);
      }
    }
  }
});
