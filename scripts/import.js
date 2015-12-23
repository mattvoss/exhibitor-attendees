var Converter = require("csvtojson").Converter,
    converter = new Converter({}),
    async = require('async'),
    nconf = require('nconf'),
    moment = require('moment'),
    Sequelize = require("sequelize"),
    _ = require('underscore'),
    fields = [
      {key: 'First Name', value:'firstname'},
      {key: 'Last Name', value:'lastname'},
      {key: 'Registration Date', value:'created'},
      {key: 'Confirmation Number', value:'confirmation'},
      {key: 'Company', value:'organization'},
      {key: 'Email Address', value:'email'},
      {key: 'Work Phone', value:'phone'},
      {key: 'Work Addr 1', value:'address1'},
      {key: 'Work Addr 2', value:'address2'},
      {key: 'Work City', value:'city'},
      {key: 'Work State', value:'state'},
      {key: 'Work ZIP/Postal Code', value:'zip'},
      {key: 'booths', value:'booths'}
    ],
    boothSize = function(booth) {
      if (booth.indexOf("10X20") > -1) {
        return 4;
      } else if (booth.indexOf("20X20") > -1 || booth.indexOf("10X40") > -1) {
        return 8;
      } else if (booth.indexOf("20X40") > -1) {
        return 8;
      } else if (booth.indexOf("20X50") > -1) {
        return 8;
      } else {
        return 2;
      }
    },
    configFile, config, db={}, Exhibitors, ExhibitorAttendeeNumber;

function importEx() {
  async.waterfall(
    [
      function(callback) {
        converter.fromFile(
          "./data/exhibitors.csv",
          function(err, result) {
            callback(err, result);
          }
        );
      },
      function(csv, callback) {
        var exhibitors = [];
        async.each(
          csv,
          function(exhibitor, cback) {
            var search = _.where(exhibitors, {'Confirmation Number': exhibitor['Confirmation Number']});
            if (search.length) {
              search[0].booths.push(exhibitor['Product Category']);
            } else {
              exhibitor.booths = [exhibitor['Product Category']];
              exhibitors.push(exhibitor);
            }
            cback(null);
          },
          function(err) {
            callback(null, exhibitors);
          }
        );
      },
      function(exhibitors, callback) {
        boothNumbers = [];
        async.map(
          exhibitors,
          function(exhibitor, cback) {
            var record = {};
            async.each(
              fields,
              function(field, cb) {
                if (field.value === "created") {
                  record[field.value] = moment(exhibitor[field.key], "DD-MMM-YYYY H:mm A").format("YYYY-MM-DD HH:mm:ss");
                } else if (field.value === "booths") {
                  record[field.value] = JSON.stringify(exhibitor[field.key]);
                  record["attendees"] = _.reduce(exhibitor[field.key], function(memo, booth){ return memo + boothSize(booth); }, 0);
                } else {
                  record[field.value] = exhibitor[field.key];
                }
                cb(null);
              },
              function(err) {
                cback(null, record);
              }
            );
          },
          function(err, results) {
            callback(err, results);
          }
        )
      },
      function(exhibitors, callback) {
        Exhibitors.bulkCreate(
          exhibitors
        ).then(
          function() { // Notice: There are no arguments here, as of right now you'll have to...
            return Exhibitors.findAll();
          }
        ).then(
          function(exhibitors) {
            callback(null, exhibitors);
          }
        )
      }
    ],
    function(err, results) {
      console.log(results);
    }
  );
}

function init() {
  if (process.argv[2]) {
    if (fs.lstatSync(process.argv[2])) {
      configFile = require(process.argv[2]);
    } else {
      configFile = process.cwd() + '/config/settings.json';
    }
  } else {
    configFile = process.cwd()+'/config/settings.json';
  }
  console.log(configFile);
  config = nconf
    .argv()
    .env("__")
    .file({ file: configFile });

  db.checkin = new Sequelize(
    config.get("mysql:checkin:database"),
    config.get("mysql:checkin:username"),
    config.get("mysql:checkin:password"),
    {
        dialect: 'mysql',
        omitNull: true,
        host: config.get("mysql:checkin:host") || "localhost",
        port: config.get("mysql:checkin:port") || 3306,
        pool: { maxConnections: 5, maxIdleTime: 30},
        define: {
          freezeTableName: true,
          timestamps: false
        }
  });

  Exhibitors = db.checkin.define('exhibitors', {
    id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    confirmation :        { type: Sequelize.STRING(255) },
    booths :              { type: Sequelize.STRING(255) },
    attendees:             { type: Sequelize.INTEGER, defaultValue: 0},
    firstname :           { type: Sequelize.STRING(255) },
    lastname :            { type: Sequelize.STRING(255) },
    address :             { type: Sequelize.STRING(255) },
    address2 :            { type: Sequelize.STRING(255) },
    city :                { type: Sequelize.STRING(255) },
    state :               { type: Sequelize.STRING(255) },
    zip :                 { type: Sequelize.STRING(15) },
    email :               { type: Sequelize.STRING(255) },
    phone :               { type: Sequelize.STRING(25) },
    title :               { type: Sequelize.STRING(255) },
    organization :        { type: Sequelize.STRING(255) },
    created :             { type: Sequelize.DATE },
    updated :             { type: Sequelize.DATE },
    siteId :              { type: Sequelize.STRING(10) }
  });

  ExhibitorAttendeeNumber = db.checkin.define('exhibitorAttendeeNumber', {
    id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    userId :              { type: Sequelize.INTEGER },
    eventId :             { type: Sequelize.STRING(255) },
    attendees :           { type: Sequelize.INTEGER }
  });

  importEx();
}

init();
