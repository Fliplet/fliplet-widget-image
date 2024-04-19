
Fliplet.Widget.findParents().then(function(widgets) {
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

  const dataSourceId = dynamicContainer?.dataSourceId;

  if (!dynamicContainer || !dataSourceId || (!recordContainer && !listRepeater)) {
    return;
  }

  return Fliplet.DataSources.getById(dataSourceId, {
    attributes: ['name', 'columns']
  }).then(async function(dataSource) {
    const dataSourceColumns = dataSource.columns;
    const dataSourceName = dataSource.name;

    return Fliplet.Widget.generateInterface({
      title: 'Dynamic image',
      supportUrl: 'https://www.google.com', // TODO missing link
      fields: [
        // TODO REMOVE
        // --------------------------------------------------------------------
        {
          name: 'columnEmail',
          type: 'dropdown',
          label: 'User email data field',
          options: [],
          default: '',
          required: true
        },
        {
          name: 'userDataSource',
          type: 'provider',
          label: 'Datasource',
          package: 'com.fliplet.data-source-provider',
          onEvent: function(event, data) {
            debugger;
          },
          ready: function(el, value, provider) {
            debugger;

            if (value) {
              Fliplet.DataSources.getById(value.id, {
                attributes: ['columns']
              }).then(function(columns) {
                $('#columnEmail').html('');
                $('#columnEmail').append('<option value="">Select an option</option>');
                columns.columns.forEach((el) => {
                  $('#columnEmail').append(`<option value="${el}">${el}</option>`);
                });
              });
            }
          }
        },
        // --------------------------------------------------------------------
        {
          type: 'html',
          html: `<div>
              <h3 style="color: black; font-weight: 600;">Get image from</h3>
              <p style="margin-bottom: 5px;">
                <span style="color: red;">${dataSourceId} </span>
                <span style="color: black; font-weight: 600;">${dataSourceName}</span>
              </p>
              <p style="color: grey; font-size: 10px; margin-bottom: 25px;">To change this Data Source, go to Parent data container</p>
            </div>`
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


