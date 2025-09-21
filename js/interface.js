
Fliplet.Widget.findParents({ filter: { package: 'com.fliplet.dynamic-container' } }).then(function(widgets) {
  const dynamicContainer = widgets[0];

  if (widgets.length === 0 || !dynamicContainer.dataSourceId) {
    Fliplet.Widget.generateInterface({
      title: 'Configure data image',
      fields: [
        {
          type: 'html',
          html: '<p style="color: #A5A5A5; font-size: 12px; font-weight: 400;">This component needs to be placed inside a Data container with selected Data source</p>'
        }
      ]
    });

    return Fliplet.UI.Toast('This component needs to be placed inside a Data container with selected Data source');
  }


  return Fliplet.DataSources.getById(dynamicContainer.dataSourceId, {
    attributes: ['columns']
  }).then((dataSource) => {
    return dataSource.columns.sort((columnA, columnB) => {
      return columnA.toLowerCase().localeCompare(columnB.toLowerCase());
    });
  }, () => {
    return [];
  }).then((dataSourceColumns = []) => {
    return Fliplet.Widget.generateInterface({
      fields: [
        // {
        //   type: 'provider',
        //   package: 'com.fliplet.data-source-provider',
        //   data: function() {
        //     return Fliplet.Widget.findParents({ filter: { package: 'com.fliplet.dynamic-container' } }).then((widgets) => {
        //       const dynamicContainer = widgets[0];
        //       return {
        //         readonly: true,
        //         dataSourceTitle: 'Get image from...',
        //         dataSourceId: dynamicContainer && dynamicContainer.dataSourceId,
        //         helpText: 'To change this data source, go to the parent <strong>Dynamic container</strong>'
        //       };
        //     });
        //   }
        // },
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


