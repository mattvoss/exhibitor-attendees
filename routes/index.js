(function(){
  "use strict";

var fs = require('fs'),
    path = require('path'),
    email = require('nodemailer'),
    crypto = require('crypto'),
    spawn = require('child_process').spawn,
    async = require('async'),
    bcrypt = require('bcrypt'),
    uuid = require("node-uuid"),
    glob = require('glob'),
    underscore = require('underscore'),
    handlebars = require('handlebars'),
    Sequelize = require("sequelize"),
    Swag = require('swag'),
    db = {},
    Schemas = {},
    Models = {},
    DocumentTypes = {},
    Workflows = {},
    opts = {},
    config = {},
    reconnectTries = 0,
    hmac, signature, connection, client,
    transport, acl,
    CheckinMemberFieldValues, RegMemberFieldValues, CheckinGroupMembers,
    RegGroupMembers, CheckinEventFields, CheckinBiller, RegBiller, Exhibitors,
    CheckinBillerFieldValues, RegBillerFieldValues, RegEventFees, Sites, Users,
    CheckinEventFees, CheckinExhibitorAttendeeNumber, CheckinExhibitorAttendees;

Swag.registerHelpers(handlebars);


exports.setKey = function(key, value) {
    opts[key] = value;
};

exports.initialize = function() {
    //Initialize PGsql
    //getConnection();

    //Initialize Email Client

    transport = email.createTransport("sendmail", {
       args: ["-t", "-f", "noreply@regionvivpp.org"]
    });

    console.log(opts.configs.get("redis"));

    db.registration = new Sequelize(
      opts.configs.get("mysql:registration:database"),
      opts.configs.get("mysql:registration:username"),
      opts.configs.get("mysql:registration:password"),
      {
          dialect: 'mysql',
          omitNull: true,
          host: opts.configs.get("mysql:registration:host") || "localhost",
          port: opts.configs.get("mysql:registration:port") || 3306,
          pool: { maxConnections: 5, maxIdleTime: 30},
          define: {
            freezeTableName: true,
            timestamps: false
          }
    });
    db.checkin = new Sequelize(
      opts.configs.get("mysql:checkin:database"),
      opts.configs.get("mysql:checkin:username"),
      opts.configs.get("mysql:checkin:password"),
      {
          dialect: 'mysql',
          omitNull: true,
          host: opts.configs.get("mysql:checkin:host") || "localhost",
          port: opts.configs.get("mysql:checkin:port") || 3306,
          pool: { maxConnections: 5, maxIdleTime: 30},
          define: {
            freezeTableName: true,
            timestamps: false
          }
    });

    CheckinMemberFieldValues = db.checkin.define('member_field_values', {
      id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      local_id:             { type: Sequelize.INTEGER },
      event_id:             { type: Sequelize.STRING(36) },
      field_id:             { type: Sequelize.INTEGER },
      member_id:            { type: Sequelize.INTEGER },
      value:                { type: Sequelize.TEXT }
    });

    RegMemberFieldValues = db.registration.define('exhib_dtregister_member_field_values', {
      id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      field_id:             { type: Sequelize.INTEGER },
      member_id:            { type: Sequelize.INTEGER },
      value:                { type: Sequelize.TEXT }
    });

    CheckinGroupMembers = db.checkin.define('group_members', {
      id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      groupMemberId :       { type: Sequelize.INTEGER },
      event_id :            { type: Sequelize.STRING(36) },
      groupUserId :         { type: Sequelize.INTEGER },
      created :             { type: Sequelize.DATE },
      confirmnum :          { type: Sequelize.STRING(100) },
      attend:               { type: Sequelize.BOOLEAN },
      discount_code_id :    { type: Sequelize.INTEGER },
      checked_in_time :     { type: Sequelize.DATE }
    });

    RegGroupMembers = db.registration.define('exhib_dtregister_group_member', {
      groupMemberId :       { type: Sequelize.INTEGER, primaryKey: true },
      groupUserId :         { type: Sequelize.INTEGER },
      created :             { type: Sequelize.DATE },
      confirmnum :          { type: Sequelize.STRING(100) },
      attend:               { type: Sequelize.BOOLEAN },
      discount_code_id :    { type: Sequelize.INTEGER },
      checked_in_time :     { type: Sequelize.DATE }
    });

    CheckinEventFields = db.checkin.define('event_fields', {
      id:             { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      local_id :       { type: Sequelize.INTEGER },
      event_id :       { type: Sequelize.STRING(36) },
      field_id :       { type: Sequelize.INTEGER },
      local_event_id :       { type: Sequelize.INTEGER },
      badge_order :       { type: Sequelize.INTEGER },
      class :       { type: Sequelize.TEXT },
      name :       { type: Sequelize.STRING(50) },
      label :       { type: Sequelize.STRING(255) },
      field_size:       { type: Sequelize.INTEGER },
      description :       { type: Sequelize.STRING(255) },
      ordering :       { type: Sequelize.INTEGER },
      published :       { type: Sequelize.INTEGER },
      required:       { type: Sequelize.INTEGER },
      values :       { type: Sequelize.TEXT },
      type :       { type: Sequelize.INTEGER },
      selected :       { type: Sequelize.STRING(255) },
      rows:       { type: Sequelize.INTEGER },
      cols:       { type: Sequelize.INTEGER },
      fee_field:       { type: Sequelize.INTEGER },
      fees :       { type: Sequelize.TEXT },
      new_line:       { type: Sequelize.INTEGER },
      textual :       { type: Sequelize.TEXT },
      export_individual :       { type: Sequelize.BOOLEAN },
      export_group :       { type: Sequelize.BOOLEAN },
      attendee_list :       { type: Sequelize.BOOLEAN },
      usagelimit :       { type: Sequelize.TEXT },
      fee_type :       { type: Sequelize.BOOLEAN },
      filetypes :       { type: Sequelize.TEXT },
      upload :       { type: Sequelize.BOOLEAN },
      filesize :       { type: Sequelize.INTEGER },
      hidden :       { type: Sequelize.BOOLEAN },
      allevent :       { type: Sequelize.BOOLEAN },
      maxlength :       { type: Sequelize.INTEGER },
      date_format :       { type: Sequelize.STRING(25) },
      parent_id :       { type: Sequelize.INTEGER },
      selection_values :       { type: Sequelize.TEXT },
      textareafee :       { type: Sequelize.TEXT },
      showcharcnt :       { type: Sequelize.BOOLEAN },
      default :       { type: Sequelize.BOOLEAN },
      confirmation_field :       { type: Sequelize.BOOLEAN },
      listing :       { type: Sequelize.TEXT },
      textualdisplay :       { type: Sequelize.BOOLEAN },
      applychangefee :       { type: Sequelize.BOOLEAN },
      tag :       { type: Sequelize.STRING(255) },
      all_tag_enable :       { type: Sequelize.BOOLEAN },
      minimum_group_size :       { type: Sequelize.INTEGER },
      max_group_size :       { type: Sequelize.INTEGER },
      discountcode_depend :       { type: Sequelize.BOOLEAN },
      discount_codes :       { type: Sequelize.TEXT },
      showed :       { type: Sequelize.INTEGER },
      group_behave :       { type: Sequelize.INTEGER }
    });

    CheckinBiller = db.checkin.define('biller', {
      id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId :              { type: Sequelize.INTEGER },
      eventId :             { type: Sequelize.STRING(36) },
      local_eventId :       { type: Sequelize.INTEGER },
      type :                { type: Sequelize.ENUM('I','G') },
      register_date :       { type: Sequelize.DATE },
      payment_type :        { type: Sequelize.STRING(100) },
      due_amount :          { type: Sequelize.DECIMAL(10,2) },
      pay_later_option:     { type: Sequelize.INTEGER },
      confirmNum :          { type: Sequelize.STRING(50) },
      user_id :             { type: Sequelize.INTEGER },
      payment_verified :    { type: Sequelize.INTEGER },
      pay_later_paid:       { type: Sequelize.INTEGER },
      discount_code_id :    { type: Sequelize.INTEGER },
      billing_firstname :   { type: Sequelize.STRING(150) },
      billing_lastname :    { type: Sequelize.STRING(150) },
      billing_address :     { type: Sequelize.STRING(255) },
      billing_city :        { type: Sequelize.STRING(150) },
      billing_state :       { type: Sequelize.STRING(150) },
      billing_zipcode :     { type: Sequelize.STRING(10) },
      billing_email :       { type: Sequelize.STRING(150) },
      due_payment :         { type: Sequelize.DECIMAL(10,2) },
      status :              { type: Sequelize.INTEGER },
      attend :              { type: Sequelize.BOOLEAN },
      paid_amount :         { type: Sequelize.STRING(30) },
      transaction_id :      { type: Sequelize.STRING(255) },
      memtot :              { type: Sequelize.INTEGER },
      cancel :              { type: Sequelize.INTEGER }
    });

    RegBiller = db.registration.define('exhib_dtregister_user', {
      userid :              { type: Sequelize.INTEGER, primaryKey: true },
      eventid :             { type: Sequelize.INTEGER },
      type :                { type: Sequelize.ENUM('I','G') },
      register_date :       { type: Sequelize.DATE },
      payment_type :        { type: Sequelize.STRING(100) },
      due_amount :          { type: Sequelize.DECIMAL(10,2) },
      pay_later_option:     { type: Sequelize.INTEGER },
      confirmNum :          { type: Sequelize.STRING(50) },
      user_id :             { type: Sequelize.INTEGER },
      payment_verified :    { type: Sequelize.INTEGER },
      pay_later_paid:       { type: Sequelize.INTEGER },
      discount_code_id :    { type: Sequelize.INTEGER },
      billing_firstname :   { type: Sequelize.STRING(150) },
      billing_lastname :    { type: Sequelize.STRING(150) },
      billing_address :     { type: Sequelize.STRING(255) },
      billing_city :        { type: Sequelize.STRING(150) },
      billing_state :       { type: Sequelize.STRING(150) },
      billing_zipcode :     { type: Sequelize.STRING(10) },
      billing_email :       { type: Sequelize.STRING(150) },
      due_payment :         { type: Sequelize.DECIMAL(10,2) },
      status :              { type: Sequelize.INTEGER },
      attend :              { type: Sequelize.BOOLEAN },
      paid_amount :         { type: Sequelize.STRING(30) },
      transaction_id :      { type: Sequelize.STRING(255) },
      memtot :              { type: Sequelize.INTEGER },
      cancel :              { type: Sequelize.INTEGER }
    });

    CheckinEventFees = db.checkin.define('event_fees', {
      id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      local_id :            { type: Sequelize.INTEGER },
      event_id :            { type: Sequelize.STRING(36) },
      user_id :             { type: Sequelize.INTEGER },
      basefee :             { type: Sequelize.STRING(20) },
      memberdiscount :      { type: Sequelize.STRING(12) },
      latefee :             { type: Sequelize.STRING(12) },
      birddiscount :        { type: Sequelize.STRING(12) },
      discountcodefee :     { type: Sequelize.STRING(12) },
      customfee :           { type: Sequelize.STRING(12) },
      tax :                 { type: Sequelize.STRING(12) },
      fee :                 { type: Sequelize.STRING(12) },
      paid_amount :         { type: Sequelize.STRING(12) },
      status :              { type: Sequelize.STRING(12), defaultValue: '0' },
      due:                  { type: Sequelize.STRING(20), defaultValue: '0' },
      payment_method:       { type: Sequelize.STRING(20), defaultValue: '0' },
      feedate :             { type: Sequelize.DATE },
      changefee :           { type: Sequelize.STRING(12), defaultValue: '0' },
      cancelfee :           { type: Sequelize.STRING(12), defaultValue: '0' }
    });

    RegEventFees = db.registration.define('exhib_dtregister_fee', {
      id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id :             { type: Sequelize.INTEGER },
      basefee :             { type: Sequelize.STRING(20) },
      memberdiscount :      { type: Sequelize.STRING(12) },
      latefee :             { type: Sequelize.STRING(12) },
      birddiscount :        { type: Sequelize.STRING(12) },
      discountcodefee :     { type: Sequelize.STRING(12) },
      customfee :           { type: Sequelize.STRING(12) },
      tax :                 { type: Sequelize.STRING(12) },
      fee :                 { type: Sequelize.STRING(12) },
      paid_amount :         { type: Sequelize.STRING(12) },
      status :              { type: Sequelize.STRING(12), defaultValue: '0' },
      due:                  { type: Sequelize.STRING(20), defaultValue: '0' },
      payment_method:       { type: Sequelize.STRING(20), defaultValue: '0' },
      feedate :             { type: Sequelize.DATE },
      changefee :           { type: Sequelize.STRING(12), defaultValue: '0' },
      cancelfee :           { type: Sequelize.STRING(12), defaultValue: '0' }
    });

    CheckinBillerFieldValues = db.checkin.define('biller_field_values', {
      id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      local_id :            { type: Sequelize.INTEGER },
      event_id :            { type: Sequelize.STRING(36) },
      field_id :            { type: Sequelize.INTEGER },
      user_id :             { type: Sequelize.INTEGER },
      value :               { type: Sequelize.TEXT }
    });

    RegBillerFieldValues = db.registration.define('exhib_dtregister_user_field_values', {
      id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      field_id :            { type: Sequelize.INTEGER },
      user_id :             { type: Sequelize.INTEGER },
      value :               { type: Sequelize.TEXT }
    });

    CheckinExhibitorAttendeeNumber = db.checkin.define('exhibitorAttendeeNumber', {
      id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId :              { type: Sequelize.INTEGER },
      eventId :             { type: Sequelize.STRING(255) },
      attendees :           { type: Sequelize.INTEGER }
    });

    CheckinExhibitorAttendees = db.checkin.define('exhibitorAttendees', {
      id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId :              { type: Sequelize.INTEGER },
      eventId :             { type: Sequelize.STRING(36) },
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
      siteId :              { type: Sequelize.STRING(10) },
      attend:               { type: Sequelize.BOOLEAN },
      checked_in_time :     { type: Sequelize.DATE }
    });

    Sites = db.checkin.define('siteIds', {
      id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      company:              { type: Sequelize.STRING(255) },
      street1:              { type: Sequelize.STRING(255) },
      street2:              { type: Sequelize.STRING(255) },
      city:                 { type: Sequelize.STRING(255) },
      state:                { type: Sequelize.STRING(255) },
      zipCode:              { type: Sequelize.STRING(255) },
      siteId:               { type: Sequelize.STRING(255) }
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

    Users = db.checkin.define('users', {
      id:                   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      email :               { type: Sequelize.STRING(255) },
      password :            { type: Sequelize.STRING(255) },
      firstName :           { type: Sequelize.STRING(255) },
      lastName :            { type: Sequelize.STRING(255) }
    });
};

/************
* Routes
*************/

exports.index = function(req, res){
    var init = "$(document).ready(function() { Exhibitors.start(); });";
    if (typeof req.session !== 'undefined' && typeof req.session.user !== 'undefined') {
        init = "$(document).ready(function() { Exhibitors.user = new Exhibitors.Models.User(" + JSON.stringify(req.session.user) + "); Exhibitors.start(); });";
    }
    fs.readFile(__dirname + '/../assets/templates/index.html', 'utf8', function(error, content) {
        if (error) { console.log(error); }
        var prefix = (opts.configs.get("prefix")) ? opts.configs.get("prefix") : "";
        var pageBuilder = handlebars.compile(content),
            html = pageBuilder({'init':init, 'prefix':prefix});

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(html, 'utf-8');
        res.end('\n');
    });
};

exports.refreshExhibitor = function(req, res) {
  createExhibitorModel(req.session.user, function(exhibitor) {
    console.log("user", req.session.user);
    if (!req.session.user.admin) {
      req.session.user = exhibitor;
    }
    res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.write(JSON.stringify(exhibitor), 'utf-8');
    res.end('\n');
  });
};

//Log in an existing user, starting a session

//Auth a user
exports.authUser = function(req, res) {
  var request = req,
      sendBack = function(record) {
        req.session.user = record;
        res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.write(JSON.stringify(record), 'utf-8');
        res.end('\n');
      },
      sendBackError = function() {
        res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
        res.writeHead(401, { 'Content-type': 'application/json' });
        var errorMsg = {
              status: "error",
              messsage: {
                response: "Unable to authenticate user"
              }
            };
        res.write(JSON.stringify(errorMsg), 'utf-8');
        res.end('\n');
      },
      cback = function(exhibitor) {
        if (exhibitor) {
          sendBack(exhibitor);
        } else {
          sendBackError();
        }
      };
  if (req.body.admin) {
    Users.find({ where: { email: req.body.email } }).then(function(user) {
      if (user !== null) {
        bcrypt.compare(req.body.password, user.password, function(err, result) {
          if (result) {
            user = user.get();
            user.admin = true;
            Exhibitors.findAll({
              order: [
                ['organization', 'ASC']
              ]
            }).then(
              function(exhibitors) {
                user.exhibitors = exhibitors;
                sendBack(user);
              },
              function(error) {
                console.log(error);
                sendBackError();
              }
            );
          } else {
            sendBackError();
          }
        });
      } else {
        sendBackError();
      }
    });
  } else {
    Exhibitors.find(
      {
        where: {
          confirmation: req.body.confirmation
        }
      }
    ).then(
      function(exhibitor) {
        exhibitor = exhibitor.get();
        createExhibitorModel(exhibitor, sendBack);
      },
      function(error) {
        console.log(error);
        sendBackError();
      }
    );
  }
};

exports.getUser = function(req, res) {
  var request = req,
      sendBack = function(record) {
        req.session.user = record;
        res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.write(JSON.stringify(record), 'utf-8');
        res.end('\n');
      },
      sendBackError = function() {
        res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
        res.writeHead(401, { 'Content-type': 'application/json' });
        var errorMsg = {
              status: "error",
              messsage: {
                response: "Unable to authenticate user"
              }
            };
        res.write(JSON.stringify(errorMsg), 'utf-8');
        res.end('\n');
      },
      cback = function(exhibitor) {
        if (exhibitor) {
          sendBack(exhibitor);
        } else {
          sendBackError();
        }
      };
  var user = {
      id: 1,
      firstname: "Matthew",
      lastname: "Voss",
      exhibitors: [],
      admin: true
    };
    Exhibitors.findAll({
      order: [
        ['organization', 'ASC']
      ]
    }).then(
      function(exhibitors) {
        user.exhibitors = exhibitors;
        sendBack(user);
      },
      function(error) {
        console.log(error);
        sendBackError();
      }
    );
};

exports.getExhibitor = function(req, res) {
  var request = req,
      sendBack = function(exhibitor) {
        res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.write(JSON.stringify(exhibitor), 'utf-8');
        res.end('\n');
      },
      sendBackError = function() {
        res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
        res.writeHead(401, { 'Content-type': 'application/json' });
        var errorMsg = {
              status: "error",
              messsage: {
                response: "Unable to authenticate user"
              }
            };
        res.write(JSON.stringify(errorMsg), 'utf-8');
        res.end('\n');
      };
  Exhibitors.find(
    {
      where: {
        id: req.params.exhibitorId
      }
    }
  ).then(
    function(exhibitor) {
      exhibitor = exhibitor.get();
      createExhibitorModel(exhibitor, sendBack);
    },
    function(error) {
      console.log(error);
      sendBackError();
    }
  );
};

exports.updateExhibitor = function(req, res) {
  var request = req,
      sendBack = function(exhibitor) {
        res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.write(JSON.stringify(exhibitor), 'utf-8');
        res.end('\n');
      },
      sendBackError = function() {
        res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
        res.writeHead(401, { 'Content-type': 'application/json' });
        var errorMsg = {
              status: "error",
              messsage: {
                response: "Unable to authenticate user"
              }
            };
        res.write(JSON.stringify(errorMsg), 'utf-8');
        res.end('\n');
      };
  Exhibitors.find(
    {
      where: {
        id: req.params.exhibitorId
      }
    }
  ).then(
    function(exhibitor) {
      exhibitor.update(req.body).then(
        function(exhibitor) {
          exhibitor = exhibitor.get();
          var update = underscore.findWhere(req.session.user.exhibitors, {id: parseInt(req.params.exhibitorId, 10)});
          console.log("Exhibitor", req.params.exhibitorId, update);
          underscore.extend(update, exhibitor);
          sendBack(exhibitor);
        },
        function(error) {
          console.log(error);
          sendBackError();
        }
      );
    },
    function(error) {
      console.log(error);
      sendBackError();
    }
  );
};

exports.addExhibitor = function(req, res) {
  var request = req,
      sendBack = function(exhibitor) {
        res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.write(JSON.stringify(exhibitor), 'utf-8');
        res.end('\n');
      },
      sendBackError = function() {
        res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
        res.writeHead(401, { 'Content-type': 'application/json' });
        var errorMsg = {
              status: "error",
              messsage: {
                response: "Unable to authenticate user"
              }
            };
        res.write(JSON.stringify(errorMsg), 'utf-8');
        res.end('\n');
      };
  addNewExhibitor(req.body, sendBack);
};

exports.updateAttendeeNumber = function(req, res) {
  var request = req,
      sendBack = function(exhibitor) {
        if (!req.session.user.admin) {
          req.session.user = exhibitor;
        }
        res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.write(JSON.stringify(exhibitor), 'utf-8');
        res.end('\n');
      },
      sendBackError = function() {
        res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
        res.writeHead(401, { 'Content-type': 'application/json' });
        var errorMsg = {
              status: "error",
              messsage: {
                response: "Unable to authenticate user"
              }
            };
        res.write(JSON.stringify(errorMsg), 'utf-8');
        res.end('\n');
      },
      cback = function(exhibitor) {
        if (exhibitor) {
          sendBack(exhibitor);
        } else {
          sendBackError();
        }
      };

  addExhibitor(req.params.confirmation, req.params.zipcode, req.params.attendees, cback);
};
//Log out the current user
exports.logoutUser = function(req, res) {
 req.session.destroy(function () {
    res.clearCookie('connect.sid', { path: '/' });
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(JSON.stringify({logout: true}), 'utf8');
    res.end('\n');
  });
};

exports.getBoothSize = function(req, res) {
  CheckinEventFields.find({
    where:{
      local_id: 13,
      event_id: opts.configs.get("uuid")
    }
  }).then(function(field) {
    var booth = field.values.split("|")[req.params.pos],
        size = boothSize(booth),
        result = { "val": booth, "size": size  };

    res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.write(JSON.stringify(result), 'utf-8');
    res.end('\n');
  });
};

exports.addAttendee = function(req, res) {
  var vals = [
        'userId',
        'firstname',
        'lastname',
        'address',
        'address2',
        'city',
        'state',
        'zip',
        'email',
        'phone',
        'title',
        'organization',
        'siteId',
        'created'
      ],
      results = {};
  Object.keys(req.body).forEach(function(key) {
    if (vals.indexOf(key) >= 0) {
      results[key] = req.body[key];
    }
  });

  CheckinExhibitorAttendees.create(
    results
  ).then(function(attendee) {
    console.log(attendee);
    createExhibitorModel(req.session.user, function(exhibitor) {
      if (!req.session.user.admin) {
        req.session.user = exhibitor;
      }
      res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
      res.writeHead(200, { 'Content-type': 'application/json' });
      res.write(JSON.stringify(attendee), 'utf-8');
      res.end('\n');
    });
  });
};

exports.updateAttendee = function(req, res) {
  CheckinExhibitorAttendees
  .findById(req.body.id)
  .then(function(attendee) {
    //console.log(req.body);
    attendee.updateAttributes(
      req.body,
      [
        'userId',
        'firstname',
        'lastname',
        'address',
        'address2',
        'city',
        'state',
        'zip',
        'email',
        'phone',
        'title',
        'organization',
        'siteId'
      ]
    ).then(function(attendee) {
      console.log(attendee);
      createExhibitorModel(req.session.user, function(exhibitor) {
        if (!req.session.user.admin) {
          req.session.user = exhibitor;
        }
        res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.write(JSON.stringify(attendee), 'utf-8');
        res.end('\n');
      });
    });
  });
};


exports.findSiteId = function(req, res) {
  var query = req.params.siteid;
   Sites
  .findAll({ where: ["siteId = ?", query] })
  .success(function(siteids) {
    res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.write(JSON.stringify(siteids), 'utf-8');
    res.end('\n');
  });
};

exports.exportAttendees = function(req, res) {
  var sql = "SELECT " +
            "  exhibitorAttendees.id, " +
            "  biller.confirmNum, " +
            "  exhibitorAttendees.userId, " +
            "  exhibitorAttendees.eventId, " +
            "  exhibitorAttendees.firstname, " +
            "  exhibitorAttendees.lastname, " +
            "  exhibitorAttendees.address, " +
            "  exhibitorAttendees.address2, " +
            "  exhibitorAttendees.city, " +
            "  exhibitorAttendees.state, " +
            "  exhibitorAttendees.zip, " +
            "  exhibitorAttendees.email, " +
            "  exhibitorAttendees.title, " +
            "  exhibitorAttendees.organization, " +
            "  exhibitorAttendees.siteId, " +
            "  exhibitorAttendees.phone, " +
            "  exhibitorAttendees.created, " +
            "  exhibitorAttendees.updated, " +
            "  exhibitorAttendees.attend, " +
            "  exhibitorAttendees.checked_in_time " +
            "FROM exhibitorAttendees " +
            "LEFT JOIN biller ON ( exhibitorAttendees.userId = biller.userId AND exhibitorAttendees.eventId = biller.eventId) " +
            "ORDER BY biller.id, exhibitorAttendees.lastname ASC ";
  db.checkin.query(
    sql,
    {
      replacements: {},
      type: Sequelize.QueryTypes.SELECT
    }
  ).then(function(attendees) {
    res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
    res.csv(attendees, "attendeesExport.csv");
  });
};

var boothSize = function(booth) {
  if (booth.indexOf("(10'X20')") > -1) {
    return 4;
  } else if (booth.indexOf("(20'X20')") > -1 || booth.indexOf("(10'X40')") > -1) {
    return 8;
  } else {
    return 2;
  }
};

var importExhibitor = function(billerInfo, numAttendees, cb) {
  async.waterfall([
    function(callback){
      var checkinBiller = billerInfo.get();
      checkinBiller.userId = checkinBiller.userid;
      checkinBiller.local_eventId = checkinBiller.eventid;
      checkinBiller.eventId = opts.configs.get("uuid");
      CheckinBiller.create(checkinBiller).then(function(biller) {
        callback(null, biller);
      });
    },
    function(biller, callback){
      RegBillerFieldValues.findAll({ where: {user_id: billerInfo.get("userid")} }).then(function(regBillerValues) {
        var checkinBillerValues = [];
        regBillerValues.forEach(function(values, index) {
          var vals = values.get();
          vals.local_id = vals.id;
          vals.event_id = opts.configs.get("uuid");
          vals.id = null;
          checkinBillerValues.push(vals);
        });

        CheckinBillerFieldValues.bulkCreate(checkinBillerValues).then(function(billerValues) {
          callback(null, {values: billerValues, biller: biller});
        });
      });
    },
    function(exhibitor, callback) {
      CheckinEventFields.find({
        where:{
          local_id: 13,
          event_id: opts.configs.get("uuid")
        }
      }).then(function(field) {
        var arBooths = field.get("values").split("|"),
            totalAttendees = {
              "userId": exhibitor.biller.get("userId"),
              "eventId": opts.configs.get("uuid"),
              "attendees": 0
            };
        if (numAttendees) {
          totalAttendees.attendees = parseInt(numAttendees, 10);
        } else {
          exhibitor.values.forEach(function(val, index) {
            if (val.field_id === 13) {
              var exBooths = val.value.split("|");
              console.log("Booths", exBooths);
              var standardAttendees = underscore.reduce(
                exBooths,
                function(attendees, booth){
                  var num = boothSize(arBooths[parseInt(booth,10)]);
                  console.log("Booth Attendees", num);
                  return attendees + num;
                },
                0
              );
              console.log("Standard Attendees", standardAttendees);
              totalAttendees.attendees += parseInt(standardAttendees, 10);
            } else if (val.field_id === 52) {
              console.log("Additional Attendees", val.value);
              totalAttendees.attendees += parseInt(val.value, 10);
            }
          });
        }
        CheckinExhibitorAttendeeNumber.create(totalAttendees).then(function(number) {
          callback(null, exhibitor);
        });
      });
    },
    function(exhibitor, callback){
      RegEventFees.find({ where: {user_id: billerInfo.get("userId")} }).then(function(regFees) {
        var checkinFees = regFees.get();
        checkinFees.local_id = checkinFees.id;
        checkinFees.event_id = opts.configs.get("uuid");
        checkinFees.id = null;

        CheckinEventFees.create(checkinFees).then(function(fees) {
          exhibitor.fees = fees;
          callback(null, exhibitor);
        });
      });
    }/*,
    function(billerValues, callback){
      RegGroupMembers.findAll({ where: {groupUserId: billerInfo.values.userId} }).then(function(regGroupMembers) {
        var checkinGroupMembers = [];
        regGroupMembers.forEach(function(member, index) {
          var person = member.values;
          person.event_id = opts.configs.get("uuid");
          checkinGroupMembers.push(person);
        });

        CheckinGroupMembers.bulkCreate(checkinGroupMembers).then(function(members) {
          callback(null, members);
        });
      });
    },
    function(members, callback){
      var memberIds = [];
      members.forEach(function(member, index) {
        memberIds.push(member.values.groupMemberId);
      });
      RegMemberFieldValues.findAll({ where: { member_id: { in: memberIds } } }).then(function(regMemberValues) {
        var checkinMemberValues = [];
        regMemberValues.forEach(function(values, index) {
          var vals = values.values;
          vals.local_id = checkinMemberValues.id;
          vals.event_id = opts.configs.get("uuid");
          vals.id = null;
          checkinMemberValues.push(vals);
        });

        CheckinMemberFieldValues.bulkCreate(checkinMemberValues).then(function(memberValues) {
          callback(null, memberValues);
        });
      });
    }*/
  ],function(err, results) {
    CheckinBiller.find(results.biller.id).then(function(biller) {
      console.log("biller found");
      cb(biller);
    });
  });
};

var createExhibitorModel = function(exhibitor, cb) {
   async.waterfall([
    function(callback) {
      getExhibitorAttendees(exhibitor, function(attendees) {
        exhibitor.attendeesList = attendees;
        callback(null, exhibitor);
      });
    }
  ],function(err, results) {
      cb(results);
  });
};

var getExhibitorPayments = function(biller, callback) {
  CheckinEventFees.find({
    where: {
      user_id: biller.userId,
      event_id: opts.configs.get("uuid")
    }
  }).then(function(payments) {
    payments = (payments !== null) ? payments.toJSON() : [];
    callback(payments);
  });
};

var getBillerFieldValues = function(biller, cb) {
  var sql = "SELECT event_fields.name, biller_field_values.value, event_fields.type, event_fields.values "+
            "FROM biller_field_values "+
            "JOIN event_fields  "+
            "     ON ( "+
            "        biller_field_values.field_id = event_fields.local_id  "+
            "        AND biller_field_values.event_id = event_fields.event_id "+
            "    ) "+
            "WHERE biller_field_values.user_id = :userId "+
            "      AND biller_field_values.event_id = :eventId";

  db.checkin.query(
    sql,
    {
      replacements: {
        userId: biller.userId,
        eventId: opts.configs.get("uuid")
      },
      type: Sequelize.QueryTypes.SELECT
    }
  ).then(function(fieldValues) {
    var convertToJson = function(item, cback) {
          var field = {
                "label":item.name,
                "value": item.value
              };
          if ( item.type === 1 || item.type === 3 || item.type === 4 ) {
            var ar = item.values.split("|");
            field.value = ar[item.value];
          }
          console.log(field);
          cback(null, field);
        };
    async.map(fieldValues, convertToJson, function(err, results){
      async.reduce(results, {}, function(fields, item, callback){
          fields[item.label] = item.value;
          callback(null, fields);
      }, function(err, result){
          cb(result);
      });

    });
  });
};

var getExhibitorAttendeesNumber = function(biller, callback) {
  CheckinExhibitorAttendeeNumber.find({
    where: {
      userId: biller.userId,
      eventId: opts.configs.get("uuid")
    }
  }).then(function(number) {
    callback(number.toJSON());
  });
};

var updateExhibitorAttendeesNumber = function(biller, numAttendees, callback) {
  CheckinExhibitorAttendeeNumber.find({
    where: {
      userId: biller.userId,
      eventId: opts.configs.get("uuid")
    }
  }).then(function(number) {
    number.updateAttributes(
      {
        "attendees": parseInt(numAttendees, 10)
      }
    ).then(function(number) {
      callback(number.toJSON());

    });
  });
};

var getExhibitorAttendees = function(exhibitor, callback) {
  CheckinExhibitorAttendees.findAll({
    where: {
      userId: exhibitor.id
    }
  }).then(function(attendees) {
    var convertToJson = function(item, cback) {
          cback(null, item.toJSON());
        };
    async.map(attendees, convertToJson, function(err, results){
      callback(results);
    });
  });
};

var addNewExhibitor = function(payload, callback) {
  Exhibitors.create(
    payload
  ).then(
    function(exhibitor) { // Notice: There are no arguments here, as of right now you'll have to...
      callback(exhibitor);
    }
  );
};

function pad(num, size) {
    var s = num+"";
    while (s.length < size) { s = "0" + s; }
    return s;
}

if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
  };
}

}());
