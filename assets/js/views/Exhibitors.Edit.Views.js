Exhibitors.module('Edit.Views', function(Views, App, Backbone, Marionette, $, _) {

  // Edit View
  // --------------

  Views.AttendeeFormView = Marionette.ItemView.extend({
      template: Templates.attendeesForm,
      className: "panel panel-default",
      events: {
        "click .update"   : "updateAttendee"
      },

      modelEvents: {
        'change': 'fieldsChanged'
      },

      initialize: function() {
        if (this.model.get("id")) this.model.set({uuid: this.model.get("id")});
        this.justUpdated = false;
      },

      fieldsChanged: function() {
        this.justUpdated = true;
        this.render();
      },

      onRender: function(e) {
        var submit = "<div class='form-group'><button type=\"submit\" class=\"btn btn-primary update\">Update</button></div>";
        this.form = new Backbone.Form({
            model: this.model
        }).render();

        this.$el.find(".panel-body").append(this.form.el).append(submit);
        if (this.justUpdated) {
          this.justUpdated = false;
          this.$el.find("#collapse"+this.model.get("uuid")).addClass("in");
        }
        this.$el.on('show.bs.collapse', function () {
          $("i.fa-plus-circle", $(this)).removeClass('fa-plus-circle').addClass('fa-minus-circle');
        });
        this.$el.on('hide.bs.collapse', function () {
          $("i.fa-minus-circle", $(this)).removeClass('fa-minus-circle').addClass('fa-plus-circle');
        });
      },

      updateAttendee: function(e) {
        var view = this;
        if (typeof this.form.commit() === 'undefined') {
          this.model.save(
            {},
            {
              success: function(model, response, options) {

              },
              error: function(model, xhr, options) {
                if (view.$el.find('.alert').length > 0) view.$el.find('.alert').remove();
                view.$el.find('.page-header').before('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>There has been a error trying to create this race. This is what the server told me: <strong>'+xhr.responseJSON.messsage.detail+'</strong></div>');
                $('html, body').animate({
                  scrollTop: $(".alert-dismissable").offset().top-70
                }, 2000);
              }
            }
          );
        }
      }
  });

  Views.EditAttendeesView = Marionette.CompositeView.extend({
      template: Templates.editForm,
      itemView : Views.AttendeeFormView,
      itemViewContainer: "#accordion",
      className: "row",

      initialize: function() {

      },

      onRender: function() {

      },

      onShow: function(e) {
        $(".panel-collapse:first", this.$el).addClass("in");
      }

  });

  Views.AccountSettingsView = Marionette.ItemView.extend({
      template: Templates.accountSettings,
      events: {
        "click .update-profile"    : "updateProfile"
      },
      initialize: function(){
        this.model.schema = {
          title:      {
            type: 'Select',
            options: [
              { val: false, label: 'Select a title' },
              { val: 'Mr', label: 'Mr' },
              { val: 'Mrs', label: 'Mrs' },
              { val: 'Ms', label: 'Ms' }
            ],
            editorClass: 'form-control'
          },
          firstName:  { type: 'Text', validators: ['required'], editorClass: 'form-control' },
          lastName:   { type: 'Text', validators: ['required'], editorClass: 'form-control' },
          street1:    { type: 'Text', validators: ['required'], editorClass: 'form-control' },
          street2:    { type: 'Text', editorClass: 'form-control' },
          city:       { type: 'Text', validators: ['required'], editorClass: 'form-control' },
          state:      { type: 'Select', options: App.Users.states, validators: ['required'], editorClass: 'form-control' },
          zipCode:    { type: 'Text', validators: ['required'], editorClass: 'form-control' },
          phone:      { type: 'Text', validators: ['required'], editorClass: 'form-control' },
          email:      { validators: ['required', 'email'], editorClass: 'form-control' }
        };
      },

      onRender: function() {
        var submit = "<div class='form-group'><button type=\"submit\" class=\"btn btn-default update-profile\">Update Profile</button></div>";
        this.form = new Backbone.Form({
            model: this.model
        }).render();

        this.$el.find("#accountSettingsMain").append(this.form.el).append(submit);
        this.$el.find('#c2_phone').mask('(000) 000-0000');
      },

      updateProfile: function(e) {
        var view = this;
        if (typeof this.form.commit() === 'undefined') {
          this.model.save(
            {},
            {
              success: function(model, response, options) {
                  $('.page-header').before('<div class="alert alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>Your profile has been updated.</strong></div>');
                  $('html, body').animate({
                    scrollTop: $(".alert-dismissable").offset().top-70
                  }, 2000);
              },
              error: function(model, xhr, options) {
                if ($('.alert').length > 0) $('.alert').remove();
                $('.page-header').before('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>There has been a error trying to create your user. This is what the server told me: <strong>'+xhr.responseJSON.messsage.detail+'</strong></div>');
                $('html, body').animate({
                  scrollTop: $(".alert-dismissable").offset().top-70
                }, 2000);
              }
            }
          );
        }
      }
  });


  // Application Event Handlers
  // --------------------------


});
