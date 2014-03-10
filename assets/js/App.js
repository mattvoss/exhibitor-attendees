var Exhibitors = new Backbone.Marionette.Application();

var ModalRegion = Backbone.Marionette.Region.extend({
  el: "#modal",

  constructor: function(){
    _.bindAll( this, "getEl", "showModal", "hideModal" );
    Backbone.Marionette.Region.prototype.constructor.apply(this, arguments);
    this.listenTo(this, "show", this.showModal, this);
  },

  getEl: function(selector){
    var $el = $(selector);
    $el.attr("class","modal fade");
    $el.on("hidden", this.close);
    return $el;
  },

  showModal: function(view){
    this.listenTo(view, "close", this.hideModal, this);
    this.$el.modal('show');
  },

  hideModal: function(){
    this.$el.modal('hide');
  }
});

Exhibitors.addRegions({
  body: '#body'
});

Exhibitors.on('initialize:before', function() {
  this.collections = {};
});

Exhibitors.on('initialize:after', function() {
  this.currentView = null;

  Backbone.history.start({pushState: true});
  if (typeof this.user !== 'undefined' && "id" in this.user) {
    Backbone.history.navigate("edit", { trigger: true });
  } else {
    Backbone.history.navigate("start", { trigger: true });
  }
});
