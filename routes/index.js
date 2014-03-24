(function(){
  "use strict";

var fs = require('fs'),
    path = require('path'),
    email = require('nodemailer'),
    crypto = require('crypto'),
    spawn = require('child_process').spawn,
    async = require('async'),
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
    RegGroupMembers, CheckinEventFields, CheckinBiller, RegBiller,
    CheckinBillerFieldValues, RegBillerFieldValues, RegEventFees,
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
      groupMemberId :       { type: Sequelize.INTEGER },
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
      userid :              { type: Sequelize.INTEGER },
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
      siteId :              { type: Sequelize.STRING(10) }
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
    req.session.user = exhibitor;
    res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.write(JSON.stringify(exhibitor), 'utf-8');
    res.end('\n');
  });
};

//Log in an existing user, starting a session


//Add a user
exports.addUser = function(req, res) {
    var bsalt = crypto.randomBytes(20),
        salt = bsalt.toString('hex'),
        hmac = crypto.createHmac("sha1", bsalt),
        signature = hmac.update(new Buffer(req.body.password, 'utf-8')).digest("hex"),
        user = {
          email: req.body.email,
          username: req.body.email,
          crypted_password: signature,
          salt: salt,
          admin: false,
          enabled: true,
          account_type: 1,
          title: req.body.title,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          street1: req.body.street1,
          street2: req.body.street2,
          city: req.body.city,
          state: req.body.state,
          zipCode: req.body.zipCode,
          phone: req.body.phone
        };
    Users.create(user).success(function(user) {
      var credit = {
        userId: user.values.id,
        type: "projection",
        transactionId: uuid.v4(),
        memo: "starting balance",
        amount: user.values.projectionCreditBalance
      };
      UserAccountLedger
        .create(credit)
        .then(function(projection) {
          credit = underscore.extend(
            credit,
            {
              type: "simulation",
              transactionId: uuid.v4(),
              memo: "starting balance",
              amount: user.values.simulationCreditBalance
            }
          );
          return UserAccountLedger.create(credit);
        })
        .then(function(simulation) {
          credit = underscore.extend(
            credit,
            {
              type: "voter-contacts",
              transactionId: uuid.v4(),
              memo: "starting balance",
              amount: user.values.voterContactBalance
            }
          );
          return UserAccountLedger.create(credit);
        })
        .then(function(voterContacts) {
          req.session.user = user;
          res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
          res.writeHead(200, { 'Content-type': 'application/json' });
          res.write(JSON.stringify(user), 'utf-8');
          res.end('\n');
        });

    }).error(function(error) {
      res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
      res.writeHead(500, { 'Content-type': 'application/json' });
      var errorMsg = {
            status: "error",
            messsage: error
          };
      res.write(JSON.stringify(errorMsg), 'utf-8');
      res.end('\n');
    });
};

//Update User
exports.updateUser = function(req, res) {
  var userAttributes = {
        email: req.body.email,
        username: req.body.email,
        account_type: 1,
        title: req.body.title,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        street1: req.body.street1,
        street2: req.body.street2,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        phone: req.body.phone
      },
      callback = function(user) {
        console.log(user);
        req.session.user = user;
        res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.write(JSON.stringify(user), 'utf-8');
        res.end('\n');
      };
  Users.find(req.params.userId).success(function(user) {
    user.updateAttributes(userAttributes).success(function(user) {
      getUser(user.values.id, callback);
    });
  });
};

//Auth a user
exports.authUser = function(req, res) {
  var request = req,
      sendBack = function(exhibitor) {
        req.session.user = exhibitor;
        res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.write(JSON.stringify(exhibitor), 'utf-8');
        res.end('\n');
      },
      processExhibitor = function(biller) {
        biller = biller.toJSON();
        createExhibitorModel(biller, sendBack);
      };
  CheckinBiller.find({ where: { confirmNum: req.body.confirmation, status: { gte: 0 } } }).success(function(biller) {
    if (biller !== null) {
      CheckinBillerFieldValues.find({
        where: {
          user_id: biller.values.userId,
          field_id: 8,
          event_id: opts.configs.get("uuid"),
          value: { like: "%"+req.body.zipcode+"%" }
        }
      }).success(function(billerFieldValues) {
        processExhibitor(biller);
      });
    } else {
      RegBiller.find({ where: { confirmNum: req.body.confirmation, status: { gte: 0 } } }).success(function(biller) {
        if (biller !== null) {

          RegBillerFieldValues.find({
            where: {
              user_id: biller.values.userId,
              field_id: 8,
              value: { like: "%"+req.body.zipcode+"%" }
            }
          }).success(function(billerFieldValues) {
            var callback = function(results) {
                  processExhibitor(results);
                };
            importExhibitor(biller, callback);
          });

        } else {
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
        }
      });
    }
  });
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
  }).success(function(field) {
    var booth = field.values.split("|")[req.params.pos],
        size = (booth.indexOf("(10'x20')") > -1) ? 4 : 2,
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
        'eventId',
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
  ).success(function(attendee) {
    console.log(attendee);
    createExhibitorModel(req.session.user, function(exhibitor) {
      req.session.user = exhibitor;
      res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
      res.writeHead(200, { 'Content-type': 'application/json' });
      res.write(JSON.stringify(attendee), 'utf-8');
      res.end('\n');
    });
  });
};

exports.updateAttendee = function(req, res) {
  CheckinExhibitorAttendees
  .find(req.body.id)
  .success(function(attendee) {
    //console.log(req.body);
    attendee.updateAttributes(
      req.body,
      [
        'userId',
        'eventId',
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
    ).success(function(attendee) {
      console.log(attendee);
      createExhibitorModel(req.session.user, function(exhibitor) {
        req.session.user = exhibitor;
        res.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.write(JSON.stringify(attendee), 'utf-8');
        res.end('\n');
      });
    });
  });
};

var importExhibitor = function(billerInfo, cb) {
  async.waterfall([
    function(callback){
      var checkinBiller = billerInfo.values;
      checkinBiller.local_eventId = checkinBiller.eventId;
      checkinBiller.eventId = opts.configs.get("uuid");
      CheckinBiller.create(checkinBiller).success(function(biller) {
        callback(null, biller);
      });
    },
    function(biller, callback){
      RegBillerFieldValues.findAll({ where: {user_id: billerInfo.values.userId} }).success(function(regBillerValues) {
        var checkinBillerValues = [];
        regBillerValues.forEach(function(values, index) {
          var vals = values.values;
          vals.local_id = checkinBillerValues.id;
          vals.event_id = opts.configs.get("uuid");
          vals.id = null;
          checkinBillerValues.push(vals);
        });

        CheckinBillerFieldValues.bulkCreate(checkinBillerValues).success(function(billerValues) {
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
      }).success(function(field) {
        var booths = field.values.split("|"),
            totalAttendees = {
              "userId": exhibitor.biller.userId,
              "eventId": opts.configs.get("uuid"),
              "attendees": 0
            };
        exhibitor.values.forEach(function(val, index) {
          if (val.field_id == 13) {
            var exBooths = val.value.split("|");
            console.log("Booths", exBooths);
            var standardAttendees = underscore.reduce(
              exBooths,
              function(attendees, booth){
                var num = (booths[booth].indexOf("(10'x20')") > -1) ? 4 : 2;
                console.log("Booth Attendees", num);
                return attendees + num;
              },
              0
            );
            console.log("Standard Attendees", standardAttendees);
            totalAttendees.attendees += parseInt(standardAttendees, 10);
          } else if (val.field_id == 52) {
            console.log("Additional Attendees", val.value);
            totalAttendees.attendees += parseInt(val.value, 10);
          }
        });
        CheckinExhibitorAttendeeNumber.create(totalAttendees).success(function(number) {
          callback(null, exhibitor);
        });
      });
    },
    function(exhibitor, callback){
      RegEventFees.find({ where: {user_id: billerInfo.values.userId} }).success(function(regFees) {
        var checkinFees = regFees.values;
        checkinFees.local_id = checkinFees.id;
        checkinFees.event_id = opts.configs.get("uuid");
        checkinFees.id = null;

        CheckinEventFees.create(checkinFees).success(function(fees) {
          exhibitor.fees = fees;
          callback(null, exhibitor);
        });
      });
    }/*,
    function(billerValues, callback){
      RegGroupMembers.findAll({ where: {groupUserId: billerInfo.values.userId} }).success(function(regGroupMembers) {
        var checkinGroupMembers = [];
        regGroupMembers.forEach(function(member, index) {
          var person = member.values;
          person.event_id = opts.configs.get("uuid");
          checkinGroupMembers.push(person);
        });

        CheckinGroupMembers.bulkCreate(checkinGroupMembers).success(function(members) {
          callback(null, members);
        });
      });
    },
    function(members, callback){
      var memberIds = [];
      members.forEach(function(member, index) {
        memberIds.push(member.values.groupMemberId);
      });
      RegMemberFieldValues.findAll({ where: { member_id: { in: memberIds } } }).success(function(regMemberValues) {
        var checkinMemberValues = [];
        regMemberValues.forEach(function(values, index) {
          var vals = values.values;
          vals.local_id = checkinMemberValues.id;
          vals.event_id = opts.configs.get("uuid");
          vals.id = null;
          checkinMemberValues.push(vals);
        });

        CheckinMemberFieldValues.bulkCreate(checkinMemberValues).success(function(memberValues) {
          callback(null, memberValues);
        });
      });
    }*/
  ],function(err, results) {
    CheckinBiller.find(results.biller.id).success(function(biller) {
      console.log("biller found");
      cb(biller);
    });
  });
};

var createExhibitorModel = function(biller, cb) {
   async.waterfall([
    function(callback){
      getExhibitorPayments(biller, function(payments) {
        biller.payments = payments;
        callback(null, biller);
      });
    },
    function(biller, callback) {
      getBillerFieldValues(biller, function(values) {
        biller.fieldValues = values;
        callback(null, biller);
      });
    },
    function(biller, callback) {
      getExhibitorAttendeesNumber(biller, function(number) {
        biller.totalAttendees = number;
        callback(null, biller);
      });
    },
    function(biller, callback) {
      getExhibitorAttendees(biller, function(attendees) {
        biller.attendees = attendees;
        callback(null, biller);
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
  }).success(function(payments) {
    callback(payments.toJSON());
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
    sql, null,
    { raw: true },
    {
      userId: biller.userId,
      eventId: opts.configs.get("uuid")
    }
  ).success(function(fieldValues) {
    var convertToJson = function(item, cback) {
          var field = {
                "label":item.name,
                "value": item.value
              };
          if ( item.type == 1 || item.type == 3 || item.type == 4 ) {
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
  }).success(function(number) {
    callback(number.toJSON());
  });
};

var getExhibitorAttendees = function(biller, callback) {
  CheckinExhibitorAttendees.findAll({
    where: {
      userId: biller.userId,
      eventId: opts.configs.get("uuid")
    }
  }).success(function(attendees) {
    var convertToJson = function(item, cback) {
          cback(null, item.toJSON());
        };
    async.map(attendees, convertToJson, function(err, results){
      callback(results);
    });
  });
};

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
  };
}

}());
