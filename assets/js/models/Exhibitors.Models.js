Exhibitors.module('Models', function(Models, App, Backbone, Marionette, $, _) {

  // User Model
  // ----------

  Models.states = _.extend({'false': 'Please select a state'}, Data.states);

  Models.Attendee = Backbone.SuperModel.extend({
    url: function() {
      return this.collection.exhibitor.url()+'/attendee';
    },
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
      firstname:  { type: 'Text', validators: ['required'], editorClass: 'form-control' },
      lastname:   { type: 'Text', validators: ['required'], editorClass: 'form-control' },
      title:      { type: 'Text', validators: ['required'], editorClass: 'form-control' },
      organization: { type: 'Text', validators: ['required'], editorClass: 'form-control' },
      address:    { type: 'Text', validators: ['required'], editorClass: 'form-control' },
      address2:   { type: 'Text', editorClass: 'form-control' },
      city:       { type: 'Text', validators: ['required'], editorClass: 'form-control' },
      state:      { type: 'Select', options: Models.states, validators: ['required'], editorClass: 'form-control' },
      zip:        { type: 'Text', validators: ['required'], editorClass: 'form-control' },
      phone:      { type: 'Text', editorClass: 'form-control' },
      email:      { validators: ['required', 'email'], editorClass: 'form-control' },
      siteId:     { type: 'Text', editorClass: 'form-control' },
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
