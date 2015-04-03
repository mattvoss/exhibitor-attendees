Exhibitors.module('Models', function(Models, App, Backbone, Marionette, $, _) {

  // User Model
  // ----------

  Models.states = _.extend({'false': 'Please select a state'}, Data.states);

  Models.Attendee = Backbone.SuperModel.extend({
    url: function() {
      return this.collection.exhibitor.url()+'/attendee';
    },
    idAttribute: "id",
    defaults: {
      title: '',
      firstname: '',
      lastname: '',
      organization: '',
      address: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      email: '',
      phone: '',
      siteId: '',
      userId: 0,
      eventId: '',
      created: Date.now()
    },

    schema: {
      firstname:  { title: 'First Name', type: 'Text', validators: ['required'], editorClass: 'form-control' },
      lastname:   { title: 'Last Name', type: 'Text', validators: ['required'], editorClass: 'form-control' },
      title:      { type: 'Text', validators: ['required'], editorClass: 'form-control' },
      organization: { type: 'Text', validators: ['required'], editorClass: 'form-control' },
      address:    { title: 'Street Address', type: 'Text', validators: ['required'], editorClass: 'form-control' },
      address2:   { title: 'Street Address 2', type: 'Text', editorClass: 'form-control' },
      city:       { type: 'Text', validators: ['required'], editorClass: 'form-control' },
      state:      {
        title: 'State/Province',
        type: 'Select',
        options: Models.states,
        editorClass: 'form-control',
        validators: [
            'required',
            function checkDropDown(value, formValues) {
                var err = {
                    type: 'state',
                    message: 'A state/province must be selected'
                };

                if (value === "false") { return err; }
            }
        ]
      },
      zip:        { type: 'Text', validators: ['required'], editorClass: 'form-control' },
      phone:      { type: 'Text', editorClass: 'form-control' },
      email:      { validators: ['required', 'email'], editorClass: 'form-control' },
      siteId:     {
        title: 'Site ID - Only For VPPPA Association With Full Member Status',
        type: 'Text',
        editorClass: 'form-control',
        validators: [
            function checkSiteId(value, formValues) {
                var err = {
                    type: 'siteId',
                    message: 'Site ID must be 6 digits and only numeric'
                };

                if (value.length > 0 && value.length !== 6 && !(/^\d+$/.test(value))) { return err; }
            }
        ]
      },
    },

    initialize: function() {
      if (this.isNew()) {
        this.set('created', Date.now());
        this.set('uuid', generateQuickGuid());
      }
    }

  });

  Models.Attendees = Backbone.Collection.extend({
    model: Models.Attendee
  });

  Models.User = Backbone.SuperModel.extend({
    name: 'exhibitor',
    urlRoot: '/api/exhibitor',
    idAttribute: "id",
    defaults: {
      zipcode: '',
      confirmation: ''
    },
    relations: {
      'attendees': Models.Attendees
    },
    validate: function(attrs, options) {
      if (attrs.zipcode.length < 5) {
        return {
          "error": "zipcode",
          "message": "Zip code must be at least 5 digits long"
        };
      } else if (attrs.confirmation === "") {
        return {
          "error": "confirmation",
          "message": "A confirmation number must be entered"
        };
      }
    },
    initialize: function() {
      //if (this.isNew()) this.set('created', Date.now());
    }
  });

});
