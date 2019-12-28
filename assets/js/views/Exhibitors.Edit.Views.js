Exhibitors.module('Edit.Views', function(Views, App, Backbone, Marionette, $, _) {

  // Edit View
  // --------------

  Views.AttendeeFormView = Marionette.ItemView.extend({
      template: Templates.attendeesForm,
      className: "card",
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

        this.$el.find(".card-body").append(this.form.el).prepend(submit).append(submit);
        if (this.justUpdated) {
          this.justUpdated = false;
          // this.$el.find("#collapse"+this.model.get("uuid")).addClass("in");
        }
        this.$el.on('show.bs.collapse', function () {
          $("i.fa-plus-circle", $(this)).removeClass('fa-plus-circle').addClass('fa-minus-circle');
          $('html,body').animate({'scrollTop':$('.fa-minus-circle').position().top},500);
        });
        this.$el.on('hide.bs.collapse', function () {
          $("i.fa-minus-circle", $(this)).removeClass('fa-minus-circle').addClass('fa-plus-circle');
        });
        this.$el.find('input[name=phone]').mask('(000) 000-0000');
      },

      updateAttendee: function(e) {
        var view = this,
            errors = this.form.commit();
        if (typeof errors === 'undefined') {
          $(".update", this.$el).attr("disabled", "disabled");
          this.model.save(
            {},
            {
              success: function(model, response, options) {
                var firstname = model.get("firstname"),
                    lastname = model.get("lastname");

                Messenger().post("Exhibitor Attendee ["+lastname+", "+firstname+"] has been updated.");
                $(".update", view.$el).removeAttr("disabled");
              },
              error: function(model, xhr, options) {
                if (view.$el.find('.alert').length > 0) view.$el.find('.alert').remove();
                view.$el.find('.page-header').before('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>There has been a error trying to create this race. This is what the server told me: <strong>'+xhr.responseJSON.messsage.detail+'</strong></div>');
                $(".update", view.$el).removeAttr("disabled");
                $('html, body').animate({
                  scrollTop: $(".alert-dismissable").offset().top-70
                }, 2000);

              }
            }
          );
        } else {
          var errorList = "",
              i = 0;
          _.each(errors, function(value, key, list) {
            errorList += (i > 0) ? ", " : "";
            errorList += key.capitalize();
            i++;
          });
          $('html, body').animate({
              scrollTop: $(".control-group.error").first().offset().top - 100
          }, 2000);
          Messenger().post({
            message: "You have errors that you must correct. You have issues with the following: "+errorList+".",
            type: "error"
          });
        }
      }
  });

  Views.EditAttendeesView = Marionette.CompositeView.extend({
      template: Templates.editForm,
      childView : Views.AttendeeFormView,
      childViewContainer: "#accordion",
      className: "row",

      initialize: function() {
        var test;
      },

      onRender: function() {

      },

      onShow: function(e) {
        //$(".panel-collapse:first", this.$el).addClass("in");
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
