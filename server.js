(function(){
  "use strict";

  /*  ==============================================================
      Include required packages
  =============================================================== */

  var session = require('express-session'),
      cors = require('cors'),
      bodyParser = require('body-parser'),
      methodOverride = require('method-override'),
      errorhandler = require('errorhandler'),
      cookieParser = require('cookie-parser'),
      favicon = require('serve-favicon'),
      compression = require('compression'),
      morgan = require('morgan'),
      fs = require('fs'),
      nconf = require('nconf'),
      path = require('path'),
      redis = require("redis"),
      url = require('url'),
      json2csv = require('nice-json2csv'),
      config, configFile, opts = {}, userSockets = [], publicKey, privateKey,
      redisConfig = {
          "host": "localhost",
          "port": "6379",
          "ttl": 43200,
          "db": 0
      };

  /*  ==============================================================
      Configuration
  =============================================================== */

  //used for session and password hashes
  var salt = '20sdkfjk23';

  if (process.argv[2]) {
      if (fs.lstatSync(process.argv[2])) {
          configFile = require(process.argv[2]);
      } else {
          configFile = process.cwd() + '/config/settings.json';
      }
  } else {
      configFile = process.cwd()+'/config/settings.json';
  }

  config = nconf
            .argv()
            .env("__")
            .file({ file: configFile });

  if (config.get("log")) {
      var access_logfile = fs.createWriteStream(config.get("log"), {flags: 'a'});
  }

  if (config.get("ssl")) {

      if (config.get("ssl:key")) {
          opts.key = fs.readFileSync(config.get("ssl:key"));
      }

      if (config.get("ssl:cert")) {
          opts.cert = fs.readFileSync(config.get("ssl:cert"));
      }

      if (config.get("ssl:ca")) {
          opts.ca = [];
          config.get("ssl:ca").forEach(function (ca, index, array) {
              opts.ca.push(fs.readFileSync(ca));
          });
      }

      console.log("Express will listen: https");

  }

  //Session Conf
  if (config.get("redis")) {
    redisConfig = config.get("redis");
  }

  var redisClient = redis.createClient(redisConfig.url+'/'+redisConfig.db),
      RedisStore = require('connect-redis')(session),
      allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', '*');
        res.header('Access-Control-Allow-Headers', '*');

        // intercept OPTIONS method
        if ('OPTIONS' === req.method) {
          res.send(200);
        }
        else {
          next();
        }
      };
  opts.secret = salt;
  opts.store = new RedisStore(redisConfig);

  var app = module.exports = require("sockpress").init(opts),
      router = app.express.Router(),
      apiRouter = app.express.Router();

  // Express Configuration
  var oneDay = 86400000;

  app.use(compression());
  /**
  if ("log" in config) {
    app.use(app.express.logger({stream: access_logfile }));
  }
  **/
  app.use(cookieParser());
  //app.use(favicon(path.join(__dirname, 'assets','images','favicon.ico')));
  app.use(app.express.static(__dirname + '/public'));     // set the static files location
  app.use('/css', app.express.static(__dirname + '/public/css' ));
  app.use('/js', app.express.static(__dirname + '/public/js' ));
  app.use('/images', app.express.static(__dirname + '/public/images' ));
  app.use('/img', app.express.static(__dirname + '/public/images' ));
  app.use('/fonts', app.express.static(__dirname + '/public/fonts' ));
  app.use('/assets', app.express.static(__dirname + '/assets' ));
  app.use('/lib', app.express.static(__dirname + '/lib' ));
  app.use('/bower_components', app.express.static(__dirname + '/bower_components' ));
  app.use(morgan('dev')); // log every request to the console
  app.use(bodyParser.urlencoded({'extended':'true'})); // parse application/x-www-form-urlencoded
  app.use(bodyParser.json()); // parse application/json
  app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
  app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request
  app.use(cors());
  app.use(json2csv.expressDecorator);

  var routes = require('./routes');

  routes.setKey("configs", config);
  routes.initialize();
  //ioEvents.initialize(config);

  /*  ==============================================================
      Routes
  =============================================================== */

  //Standard Routes
  router.get('/', routes.index);
  router.get('/start', routes.index);
  router.get('/edit', routes.index);
  router.get('/edit/:exhibitorId', routes.index);
  router.get('/admin', routes.index);
  router.get('/admin-dashboard', routes.index);
  app.use('/', router);

  //API
  apiRouter.post('/exhibitor/authenticate', routes.authUser);
  apiRouter.post('/user/authenticate', routes.authUser);
  apiRouter.get('/user/:userId', routes.getUser);
  apiRouter.get('/exhibitor/:confirmation/:zipcode/changeAttendees/:attendees', routes.updateAttendeeNumber);
  apiRouter.get('/user/authenticate/logout', routes.logoutUser);
  apiRouter.delete('/exhibitor/:userId', routes.logoutUser);
  apiRouter.get('/getbooths/:pos', routes.getBoothSize);
  apiRouter.get('/exhibitor/refresh', routes.refreshExhibitor);
  apiRouter.post('/exhibitor', routes.addExhibitor);
  apiRouter.get('/exhibitor/:exhibitorId', routes.getExhibitor);
  apiRouter.put('/exhibitor/:exhibitorId', routes.updateExhibitor);
  apiRouter.post('/exhibitor/:exhibitorId/attendee', routes.addAttendee);
  apiRouter.put('/exhibitor/:exhibitorId/attendee', routes.updateAttendee);
  apiRouter.get('/exportAttendees', routes.exportAttendees);
  apiRouter.get('/siteid/:siteid', routes.findSiteId);
  app.use('/api', apiRouter);

  /*  ==============================================================
      Socket.IO Routes
  =============================================================== */

  /*
  routes.setKey("io", app.io);
  app.io.route('ready', ioEvents.connection);
  app.io.route('room:join', ioEvents.onJoinRoom);
  app.io.route('room:leave', ioEvents.onLeaveRoom);
  app.io.route('refreshToken', ioEvents.refreshToken);
  */

  /*  ==============================================================
      Launch the server
  =============================================================== */
  var port = (config.get("port")) ? config.get("port") : 3001;
  app.listen(port);

}());
