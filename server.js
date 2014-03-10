/*  ==============================================================
    Include required packages
=============================================================== */

var express = require('express.io'),
    fs = require('fs'),
    nconf = require('nconf'),
    path = require('path'),
    redis = require("redis"),
    redisClient = redis.createClient(),
    redisStore = require('connect-redis')(express),
    CacheControl = require("express-cache-control"),
    cache = new CacheControl().middleware,
    config, configFile, opts, userSockets = [];

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
    var redisConfig = config.get("redis");
} else {
    var redisConfig = {
        "host": "localhost",
        "port": "6379",
        "ttl": 43200,
        "db": "exhibitorAttendees"
    };
}

var app = module.exports = express(opts);

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

// Configuration
var oneDay = 86400000,
    cookieParser = express.cookieParser();
app.configure(function(){
    if ("log" in config) {
        app.use(express.logger({stream: access_logfile }));
    }
    app.use(cookieParser);
    app.use(express.session({
        store: new redisStore(redisConfig),
        secret: salt,
        proxy: true
    }));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(allowCrossDomain);
    //app.use('/bootstrap', express.static(__dirname + '/public/bootstrap'));
    app.use('/css', express.static(__dirname + '/public/css', { maxAge: oneDay }));
    app.use('/js', express.static(__dirname + '/public/js', { maxAge: oneDay }));
    app.use('/images', express.static(__dirname + '/public/images', { maxAge: oneDay }));
    app.use('/img', express.static(__dirname + '/public/images', { maxAge: oneDay }));
    app.use('/fonts', express.static(__dirname + '/public/fonts', { maxAge: oneDay }));
    app.use(app.router);
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

//delete express.bodyParser.parse['multipart/form-data'];
//app.use(express.favicon(__dirname + '/public/favicon.ico'));


/*  ==============================================================
    Serve the site skeleton HTML to start the app
=============================================================== */

var port = ("port" in config) ? config.port : 3001;
if ("ssl" in config) {
    var server = app.https(opts).io();
} else {
    var server = app.http().io();
}

var routes = require('./routes');

routes.setKey("configs", config);
routes.initialize();

/*  ==============================================================
    Routes
=============================================================== */

//API
app.post('/api/exhibitor/authenticate', routes.authUser);
app.get('/api/user/authenticate/logout', routes.logoutUser);
app.del('/api/exhibitor/logout/:userId', routes.logoutUser);
app.get('/api/getbooths/:pos', routes.getBoothSize);
app.get('/api/exhibitor/refresh', routes.refreshExhibitor);
app.post('/api/exhibitor/:exhibitorId/attendee', routes.addAttendee);
app.put('/api/exhibitor/:exhibitorId/attendee', routes.updateAttendee);

// Global handling
app.get('/', cache("hours", 1), routes.index);
app.get('*', cache("hours", 1), routes.index);


/*  ==============================================================
    Launch the server
=============================================================== */

server.listen(port);
console.log("Express server listening on port %d", port);
