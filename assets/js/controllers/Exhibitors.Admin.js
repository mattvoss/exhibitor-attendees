Exhibitors.module('Admin', function(Admin, App, Backbone, Marionette, $, _) {

  // Edit Router
  // ---------------
  //
  // Handle routes to show the active vs complete todo items

  Admin.Router = Marionette.AppRouter.extend({
    appRoutes: {
      'admin-dashboard'      : 'initAdmin',
      'add'                  : 'showAdd'
    }
  });




  // Edit Controller (Mediator)
  // ------------------------------
  //
  // Control the workflow and logic that exists at the application
  // level, above the implementation detail of views and models

  Admin.Controller = function() {};

  _.extend(Admin.Controller.prototype, {

    initAdmin: function() {
      if (typeof App.user == 'undefined' || !App.user.get("admin")) {
        Backbone.history.navigate("admin", { trigger: true });
      } else {
        var options = {login: false};
        this.appBody = new App.Layout.Body(options);
        App.body.show(this.appBody);
        this.showHeader();
        this.showDashboard();
      }
    },

    showDashboard: function() {
      var dashboard = new Admin.Views.DashboardView({model: App.user, collection: App.user.get('exhibitors')});
      $("#main").addClass("dashboard");
      this.appBody.main.show(dashboard);
      $("body").removeClass();

      //$("#dash-container").show();
    },

    showAdd: function() {
      var exhibitor = new App.Models.Exhibitor();
      var add = new Admin.Views.AddView({model: exhibitor});
      $("#main").addClass("dashboard");
      this.appBody.main.show(add);
      $("body").removeClass();

      //$("#dash-container").show();
    },

    showHeader: function() {
      var header = new App.Layout.Header({model: App.user});
      this.appBody.header.show(header);
    }

  });

  // Edit Initializer
  // --------------------
  //
  // Get the Edit up and running by initializing the mediator
  // when the the application is started.

  Admin.addInitializer(function() {

    var controller = new Admin.Controller();
    new Admin.Router({
      controller: controller
    });

  });

});
