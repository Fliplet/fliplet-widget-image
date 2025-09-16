Fliplet.Widget.findParents().then(async(widgets) => {
  const findParentDataWidget = async(packageName, parents) => {
    const parent = parents.find((parent) => parent.package === packageName);

    if (!parent) {
      return [null];
    }

    return [parent];
  };

  const [[ dynamicContainer ], [ recordContainer ], [ listRepeater ]] = await Promise.all([
    findParentDataWidget('com.fliplet.dynamic-container', widgets),
    findParentDataWidget('com.fliplet.record-container', widgets),
    findParentDataWidget('com.fliplet.list-repeater', widgets)
  ]);

  if (!dynamicContainer || !dynamicContainer.dataSourceId) {
    return Fliplet.Widget.generateInterface({
      title: 'Configure data image',
      fields: [
        {
          type: 'html',
          html: '<p style="color: #A5A5A5; font-size: 12px; font-weight: 400;">This component needs to be placed inside a Data container with selected Data source</p>'
        }
      ]
    });
  } else if (!recordContainer && !listRepeater) {
    return Fliplet.Widget.generateInterface({
      title: 'Configure data image',
      fields: [
        {
          type: 'html',
          html: '<p style="color: #A5A5A5; font-size: 12px; font-weight: 400;">This component needs to be placed inside a Record or Data list component</p>'
        }
      ]
    });
  }

  return Fliplet.DataSources.getById(dynamicContainer.dataSourceId, {
    attributes: ['columns']
  }).then((dataSource) => {
    return _.orderBy(dataSource.columns, column => column.toLowerCase());
  }, () => {
    return [];
  }).then((dataSourceColumns = []) => {
    return Fliplet.Widget.generateInterface({
      fields: [
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


