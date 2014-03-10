$(window).resize(function () {
  //Politkz.vent.trigger('layout:resize');
});


ReplaceRegion = Marionette.Region.extend({
    open: function(view){
        this.$el.replaceWith(view.$el);
    }
});

Swag.registerHelpers(Handlebars);

$(document).on("click", "a:not([data-bypass])", function(evt) {
  var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
  var root = location.protocol + "//" + location.host + Backbone.history.options.root;

  if (href.prop && href.prop.slice(0, root.length) === root) {
    evt.preventDefault();
    Backbone.history.navigate(href.attr, true);
  }
});

//  format an ISO date using Moment.js
//  http://momentjs.com/
//  moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
//  usage: {{dateFormat creation_date format="MMMM YYYY"}}
Handlebars.registerHelper('dateFormat', function(context, block) {
  if (window.moment && context !== null) {
    var f = block.hash.format || "MMM Do, YYYY";
    //return moment(context.replace("Z","")).format(f);
    return moment(context).format(f);
  }else{
    return context;   //  moment plugin not available. return data as is.
  }
});

// usage: {{fromNow date}}
Handlebars.registerHelper('fromNow', function(date) {
    return moment(date).fromNow();
});


// Comparison Helper for handlebars.js
// Pass in two values that you want and specify what the operator should be
// e.g. {{#compare val1 val2 operator="=="}}{{/compare}}

Handlebars.registerHelper('compare', function(lvalue, rvalue, options) {

    if (arguments.length < 3)
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

    operator = options.hash.operator || "==";

    var operators = {
          '==':       function(l,r) { return l == r; },
          '===':      function(l,r) { return l === r; },
          '!=':       function(l,r) { return l != r; },
          '<':        function(l,r) { return l < r; },
          '>':        function(l,r) { return l > r; },
          '<=':       function(l,r) { return l <= r; },
          '>=':       function(l,r) { return l >= r; },
          'typeof':   function(l,r) { return typeof l == r; }
        };

    if (!operators[operator])
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

    var result = operators[operator](lvalue,rvalue);

    if( result ) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('each_with_index', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  var i = 0, ret = "", data;

  var type = toString.call(context);

  if (options.data) {
    data = Handlebars.createFrame(options.data);
  }

  if(context && typeof context === 'object') {
    if(context instanceof Array){
      for(var j = context.length; i<j; i++) {
        if (data) { data.index = i; }
        ret = ret + fn(context[i], { data: data });
      }
    } else {
      for(var key in context) {
        if(context.hasOwnProperty(key)) {
          if(data) { data.key = key; data.index = i; }
          ret = ret + fn(context[key], {data: data});
          i++;
        }
      }
    }
  }

  if(i === 0){
    ret = inverse(this);
  }

  return ret;
});


Handlebars.registerHelper('iter', function(context, options) {
    var fn = options.fn, inverse = options.inverse;
    var ret = "";

    if(context && context.length > 0) {
        for(var i=0, j=context.length; i<j; i++) {
            ret = ret + fn(_.extend({}, context[i], { i: i, iPlus1: i + 1 }));
        }
    } else {
        ret = inverse(this);
    }
    return ret;
});

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function generateQuickGuid() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}
