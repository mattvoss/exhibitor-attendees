Exhibitors.module('Edit', function(Edit, App, Backbone, Marionette, $, _) {

  // Edit Router
  // ---------------
  //
  // Handle routes to show the active vs complete todo items

  Edit.Router = Marionette.AppRouter.extend({
    appRoutes: {
      ''          : 'init',
      'edit'      : 'init'
    }
  });




  // Edit Controller (Mediator)
  // ------------------------------
  //
  // Control the workflow and logic that exists at the application
  // level, above the implementation detail of views and models

  Edit.Controller = function() {};

  _.extend(Edit.Controller.prototype, {

    init: function() {
      if (typeof App.user == 'undefined') {
        Backbone.history.navigate("start", { trigger: true });
      } else {
        var options = {login: false};
        this.appBody = new App.Layout.Body(options);
        App.body.show(this.appBody);
        this.showHeader();
        this.showEdit();
      }
    },

    showEdit: function() {
      App.attendees = new App.Models.Attendees();
      var numberAttendeesToAdd = App.user.get("totalAttendees").get('attendees') - App.user.get('attendees').length;
      for (i = 0; i < numberAttendeesToAdd; i++) {
        var mod = new App.Models.Attendee(App.user.get("fieldValues").toJSON());
        mod.set({
          firstname: "Attendee",
          lastname: "#"+(i+1).toString(),
          userId: App.user.get("userId"),
          eventId: App.user.get("eventId")
        });
        //mod.parent = App.user;
        App.user.get('attendees').add(mod);
      }
      var editAttendees = new Edit.Views.EditAttendeesView({model: App.user, collection: App.user.get('attendees')});
      $("#main").addClass("dashboard");
      this.appBody.main.show(editAttendees);
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

  Edit.addInitializer(function() {

    var controller = new Edit.Controller();
    new Edit.Router({
      controller: controller
    });

    controller.init();

  });

});
