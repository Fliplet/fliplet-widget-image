
Fliplet.Widget.findParents({ filter: { package: 'com.fliplet.dynamic-container' } }).then(function(widgets) {
  const dynamicContainer = widgets[0];

  return Fliplet.DataSources.getById(dynamicContainer && dynamicContainer.dataSourceId, {
    attributes: ['columns']
  }).then((dataSource) => {
    return _.orderBy(dataSource.columns, column => column.toLowerCase());
  }, () => {
    return [];
  }).then((dataSourceColumns = []) => {
    return Fliplet.Widget.generateInterface({
      fields: [
        {
          type: 'provider',
          package: 'com.fliplet.data-source-provider',
          data: function() {
            return Fliplet.Widget.findParents({ filter: { package: 'com.fliplet.dynamic-container' } }).then((widgets) => {
              const dynamicContainer = widgets[0];

              return {
                readonly: true,
                dataSourceTitle: 'Get image from...',
                dataSourceId: dynamicContainer && dynamicContainer.dataSourceId,
                helpText: 'To change this data source, go to the parent <strong>Data container</strong>'
              };
            });
          }
        },
        {
          name: 'imageColumnName',
          type: 'dropdown',
          label: 'Select image column',
          options: dataSourceColumns,
          default: ''
        },
        {
          name: 'showIfImageNotFound',
          type: 'radio',
          label: 'If no image found',
          options: [
            { value: 'placeholder', label: 'Show placeholder' },
            { value: 'none', label: 'None' }
          ],
          default: 'placeholder'
        }
      ]
    });
  });
});


