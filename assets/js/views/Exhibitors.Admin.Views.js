Exhibitors.module('Admin.Views', function(Views, App, Backbone, Marionette, $, _) {

  // Admin View
  // --------------

  Views.ExhibitorView = Marionette.ItemView.extend({
      tagName: "tr",
      template: Templates.exhibitor,
      events: {
        "click .btn-primary"   : "editExhibitor",
        "click .spinner .btn:first-of-type": "spinnerUp",
        "click .spinner .btn:last-of-type": "spinnerDown"
      },
      ui: {
        input: '.spinner input'
      },

      modelEvents: {
        'change': 'fieldsChanged'
      },

      initialize: function() {

      },

      fieldsChanged: function() {
        //console.log("updated");
        this.justUpdated = true;
        this.render();
      },

      onRender: function(e) {

      },

      editExhibitor: function(e) {
        Backbone.history.navigate("edit/"+this.model.id, { trigger: true });
      },

      spinnerUp: function(e) {
        this.model.set("attendees", parseInt(this.model.get("attendees"), 10) + 1);
        this.updateExhibitor();
      },
      spinnerDown: function(e) {
        this.model.set("attendees", parseInt(this.model.get("attendees"), 10) - 1);
        this.updateExhibitor();
      },

      updateExhibitor: _.debounce(function(){
        this.model.save();
      }, 2000)
  });

  Views.DashboardView = Marionette.CompositeView.extend({
      template: Templates.dash,
      childView : Views.ExhibitorView,
      childViewContainer: "#table-body",
      events: {
        "click .add"   : "addExhibitor",
      },
      className: "row",

      initialize: function() {
        var test;
      },

      onRender: function() {

      },

      onShow: function(e) {
        //$(".panel-collapse:first", this.$el).addClass("in");
      },

      addExhibitor: function(e) {
        Backbone.history.navigate("add", { trigger: true });
      }

  });

  Views.AddView = Marionette.ItemView.extend({
      template: Templates.add,
      events: {
        "click .btn-primary"   : "addExhibitor",
      },
      initialize: function() {
        var test;
      },

      onRender: function() {
        var submit = "<div class='form-group'><button type=\"submit\" class=\"btn btn-primary add\">Add</button></div>";
        this.form = new Backbone.Form({
          model: this.model
        }).render();

        this.$el.find("#form-body").append(this.form.el).append(submit);
      },

      onShow: function(e) {
        //$(".panel-collapse:first", this.$el).addClass("in");
      },

      addExhibitor: function(e) {
        var view = this,
            errors = this.form.commit();
        if (typeof errors === 'undefined') {
          $(".update", this.$el).attr("disabled", "disabled");
          this.model.save(
            {},
            {
              success: function(model, response, options) {
                Messenger().post("Exhibitor has been added.");
                $(".update", view.$el).removeAttr("disabled");
                App.user.get("exhibitors").add(model);
                App.user.fetch(
                  {
                    reset: true,
                    success: function (collection, response, options) {
                      Backbone.history.navigate("admin-dashboard", { trigger: true });
                    },
                    error: function (collection, response, options) {
                        // you can pass additional options to the event you trigger here as well
                        self.trigger('errorOnFetch');
                    }
                  }
                );

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


  // Application Event Handlers
  // --------------------------


});
