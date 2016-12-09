Exhibitors.module('Edit', function(Edit, App, Backbone, Marionette, $, _) {

  // Edit Router
  // ---------------
  //
  // Handle routes to show the active vs complete todo items

  Edit.Router = Marionette.AppRouter.extend({
    appRoutes: {
      ''          : 'init',
      'edit'      : 'init',
      'edit/:id'  : 'init'
    }
  });




  // Edit Controller (Mediator)
  // ------------------------------
  //
  // Control the workflow and logic that exists at the application
  // level, above the implementation detail of views and models

  Edit.Controller = function() {};

  _.extend(Edit.Controller.prototype, {

    init: function(id) {
      id = id || null;
      //console.log(id);
      if (typeof App.user == 'undefined' && Backbone.history.location.pathname.indexOf("admin") === -1) {
        Backbone.history.navigate("start", { trigger: true });
      } else if (App.user.get("admin") && Backbone.history.location.pathname.indexOf("/admin") > -1) {
        Backbone.history.navigate("admin-dashboard", { trigger: true });
      } else {
        var options = {login: false};
        this.appBody = new App.Layout.Body(options);
        App.body.show(this.appBody);
        this.showHeader();
        this.showEdit(id);
      }
    },

    showEdit: function(id) {
      App.attendees = new App.Models.Attendees();
      var view = this,
          finish = function(exhibitor) {
            var currNumAttendees = (exhibitor.get('attendeesList')) ? exhibitor.get('attendeesList').length : 0,
                numberAttendeesToAdd = exhibitor.get('attendees') - currNumAttendees;
            //console.log(numberAttendeesToAdd);
            for (i = 0; i < numberAttendeesToAdd; i++) {
              var attendee = exhibitor.toJSON();
              delete attendee.attendeesList;
              delete attendee.id;
              var mod = new App.Models.Attendee(attendee);
              mod.set({
                firstname: "Attendee",
                lastname: "#"+(i+1).toString(),
                userId: exhibitor.get("id")
              });
              //mod.parent = App.user;
              exhibitor.get('attendeesList').add(mod);
            }
            if (id) {
              exhibitor.set("admin", true);
            }
            var editAttendees = new Edit.Views.EditAttendeesView({model: exhibitor, collection: exhibitor.get('attendeesList')});
            $("#main").addClass("dashboard");
            view.appBody.main.show(editAttendees);
            $("body").removeClass();
          };

      if (id) {
        var exhibitor = new App.Models.User({id: id, admin: true});
        exhibitor.fetch(
          {
            reset: true,
            success: function (collection, response, options) {
              finish(exhibitor);
            },
            error: function (collection, response, options) {
                // you can pass additional options to the event you trigger here as well
                self.trigger('errorOnFetch');
            }
          }
        );
      } else {
        finish(App.user);
      }

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

    //controller.init();

  });

});
