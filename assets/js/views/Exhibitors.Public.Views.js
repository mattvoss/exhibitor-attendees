Exhibitors.module('Public.Views', function(Views, App, Backbone, Marionette, $, _) {

  // Public View
  // --------------

  Views.AlertView = Marionette.ItemView.extend({
    template: Templates.alert,
    className: "alert alert-danger fade in",
  });

  Views.PublicView = Marionette.ItemView.extend({
      template: Templates.public,
      className: "row",
      events: {
        'keypress #confirmation'  :   'onInputKeypress',
        'click .sign-in'      :   'logIn',
      },

      ui: {
        confirmation: '#confirmation'
      },

      initialize: function() {

      },

      onRender: function() {
        //App.main.$el.removeClass('container').addClass('jumbotron');
        //App.header.$el.hide();
        //App.footer.$el.hide();
      },

      onInputKeypress: function(evt) {
        var ENTER_KEY = 13;
        evt.stopImmediatePropagation();
        if (evt.which === ENTER_KEY && this.ui.confirmation.val().length > 0) {
          this.logIn(evt);
        }
      },

      showAlert: function(model) {
        var alert = new App.Public.Views.AlertView({model: model});
        $("#confirmation", this.$el).removeClass("alert-danger");
        $(".alert", this.$el).remove();
        alert.render();
        $("#"+model.get("error"), this.$el).addClass("alert-danger");
        $(alert.$el).insertBefore(".login-title", this.$el);
      },

      logIn: function(e) {
        var view = this;
        App.user.set({
          confirmation: this.ui.confirmation.val().trim()
        });
        if (App.user.isValid()) {
          App.user.urlRoot = "/api/exhibitor/authenticate";

          App.user.save(
            {},
            {
              success: function(model, response, options) {
                //App.login.$el.hide();
                App.user.urlRoot = "/api/exhibitor";
                Backbone.history.navigate("edit", { trigger: true });
              },
              error: function(model, xhr, options) {
                var alertModel = new Backbone.Model({
                      'error': 'login',
                      'message': 'The confirmation number could not be found'
                    });
                alert = new App.Public.Views.AlertView({model: alertModel});
                $("#confirmation", view.$el).removeClass("alert-danger");
                $(".alert", view.$el).remove();
                alert.render();
                $(alert.$el).insertBefore(".login-title", this.$el);
              }
            }
          );
        } else {
          var model = new Backbone.Model(App.user.validationError);
          this.showAlert(model);
        }
      },

      update: function() {

      }

  });

  Views.AdminView = Marionette.ItemView.extend({
      template: Templates.admin,
      className: "row",
      events: {
        'keypress #confirmation'  :   'onInputKeypress',
        'click .sign-in'      :   'logIn',
      },

      ui: {
        email: '#email',
        password: '#password'
      },

      initialize: function() {

      },

      onRender: function() {
        //App.main.$el.removeClass('container').addClass('jumbotron');
        //App.header.$el.hide();
        //App.footer.$el.hide();
      },

      onInputKeypress: function(evt) {
        var ENTER_KEY = 13;

        if (evt.which === ENTER_KEY && this.ui.password.val().length > 0) {
          this.logIn(evt);
        }
      },

      showAlert: function(model) {
        var alert = new App.Public.Views.AlertView({model: model});
        $("#username", this.$el).removeClass("alert-danger");
        $("#password", this.$el).removeClass("alert-danger");
        $(".alert", this.$el).remove();
        alert.render();
        $("#"+model.get("error"), this.$el).addClass("alert-danger");
        $(alert.$el).insertBefore(".login-title", this.$el);
      },

      logIn: function(e) {
        var view = this;
        App.user.set({
          admin: true,
          email: this.ui.email.val().trim(),
          password: this.ui.password.val().trim()
        });
        if (App.user.isValid()) {
          App.user.urlRoot = "/api/user/authenticate";

          App.user.save(
            {},
            {
              success: function(model, response, options) {
                //App.login.$el.hide();
                App.user.urlRoot = "/api/user";
                Backbone.history.navigate("admin-dashboard", { trigger: true });
              },
              error: function(model, xhr, options) {
                var alertModel = new Backbone.Model({
                      'error': 'login',
                      'message': 'The confirmation number could not be found'
                    });
                alert = new App.Public.Views.AlertView({model: alertModel});
                $("#username", this.$el).removeClass("alert-danger");
                $("#password", this.$el).removeClass("alert-danger");
                $(".alert", view.$el).remove();
                alert.render();
                $(alert.$el).insertBefore(".login-title", this.$el);
              }
            }
          );
        } else {
          var model = new Backbone.Model(App.user.validationError);
          this.showAlert(model);
        }
      },

      update: function() {

      }

  });

  // Application Event Handlers
  // --------------------------

});
