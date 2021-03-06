Exhibitors.module('Layout', function(Layout, App, Backbone, Marionette, $, _) {

  Layout.Body = Marionette.LayoutView.extend({
    initialize: function(options){
      this.options = _.extend({login: false}, options);
      var view = this;
      if (this.options.login) {
        this.addRegions({
          login: '#loginContainer'
        });
        this.template = Templates.bodyLogin;
      } else {
        this.addRegions({
          header: '#header',
          main: "#main",
          modal: ModalRegion
        });
        this.template = Templates.bodyMain;
        App.vent.on('layout:resize', function (bg) {
          //view.resize();
        });

      }
    },
    className: "appBodyContainer",
    // UI bindings create cached attributes that
    // point to jQuery selected objects
    ui: {

    },

    events: {

    },
    resize: function() {
      $("#sidebar").height($("#container").height());
    },

    onShow: function() {
      this.resize();
    }
  });

  Layout.Header = Marionette.ItemView.extend({
    initialize: function(options){
      this.opts = _.extend({light: false}, options);
    },
    template: Templates.header,
    className: "container-fluid",
    events: {
      "click a": "handleLink"
    },
    onRender: function() {
        /**
      if (this.opts.light) {
        this.$el.removeClass("navbar-inverse").addClass("navbar-default");
      } else {
        this.$el.removeClass("navbar-default").addClass("navbar-inverse");
      }
      **/
    },

    handleLink: function(e) {
        e.preventDefault();
        Backbone.history.navigate($(e.currentTarget).data().url, { trigger: true });

    }
  });


});
