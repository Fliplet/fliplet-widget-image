
Fliplet.Widget.findParents({ filter: { package: 'com.fliplet.dynamic-container' } }).then(function(widgets) {
  if (!widgets.length) {
    return Promise.reject('This widget must be placed inside a Dynamic Container component');
  }

  const dynamicContainerParent = widgets[0];
  const dataSourceId = dynamicContainerParent.dataSourceId;

  return Fliplet.DataSources.getById(dataSourceId, {
    attributes: ['name', 'columns']
  }).then(async function(dataSource) {
    const dataSourceColumns = dataSource.columns;
    const dataSourceName = dataSource.name;

    return Fliplet.Widget.generateInterface({
      title: 'Image component',
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
          html: `<header>
              <p>
                Configure image
              <a
                href="https://help.fliplet.com/image-component/"
                class="help-icon"
                target="_blank"
              >
                <i class="fa fa-question-circle-o"></i>
              </a>
              </p>
            </header>`
        },
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
            { value: 'Placeholder', label: 'Show placeholder' },
            { value: 'None', label: 'None' }
          ],
          default: 'Placeholder'
        }
      ]
    });
  });
});


