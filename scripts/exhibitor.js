var mysql       = require('mysql'),
    program     = require('commander'),
    path        = require('path'),
    eventExists = false;

program
  .version('0.0.1')
  .option('-c, --config [value]', 'Path to configuration file in JSON format')
  .parse(process.argv);

console.log(program.configuration);
var config = (program.config) ? require(path.join(__dirname,program.config)) : require('../config.json');

var remoteConnection = mysql.createConnection({
        host     : config.remote.host,
        database : config.remote.database,
        user     : config.remote.user,
        password : config.remote.password
    }),
    localConnection = mysql.createConnection({
        host     : config.local.host,
        database : config.local.database,
        user     : config.local.user,
        password : config.local.password
    });

remoteConnection.connect();
localConnection.connect();

var checkEventExists = function() {
    var vars = [config.uuid];
    localConnection.query('SELECT * FROM event WHERE eventId = ?', vars, function(err, rows, fields) {
        if (err) throw err;
        eventExists = (rows.length > 0) ? true : false;
        console.log(eventExists);
        getRemoteEventInfo();
    });
}

var getRemoteEventInfo = function() {
    var vars = [config.remoteEventId];
    remoteConnection.query('SELECT * FROM '+config.prefix+'_dtregister_group_event WHERE slabid = ?', vars, function(err, rows, fields) {
        if (err) throw err;
        rows[0]["local_slabId"] = rows[0]["slabId"];
        if (!eventExists) {
            rows[0]["slabId"] = null;
        } else {
            delete rows[0]["slabId"];
        }
        rows[0]["local_eventId"] = rows[0]["eventId"];
        rows[0]["eventId"] = config.uuid;
        updateEventInfo(rows[0]);
    });
}

var updateEventInfo = function(event) {
    var sql = "";
    if (eventExists) {
        sql = "UPDATE event SET ? WHERE eventId = '"+event.eventId+"'";
    } else {
        sql = "INSERT INTO event SET ?";
    }
    localConnection.query(sql, event, function(err, result) {
        if (err) throw err;
        console.log(result);
        getEventFields();
    });
}

var getEventFields = function() {
    var sql = "",
        vars = [config.remoteEventId];

    if (config.type == "exhibitor") {
        sql = "SELECT "+config.prefix+"_dtregister_fields.*"+
              "  FROM "+config.prefix+"_dtregister_fields";
    } else {
        sql = "SELECT "+config.prefix+"_dtregister_fields.*,"+
              "  "+config.prefix+"_dtregister_field_event.showed,"+
              "  "+config.prefix+"_dtregister_field_event.event_id,"+
              "  "+config.prefix+"_dtregister_field_event.group_behave"+
              "  FROM "+config.prefix+"_dtregister_field_event"+
              "  LEFT JOIN "+config.prefix+"_dtregister_fields ON "+config.prefix+"_dtregister_field_event.field_id = "+config.prefix+"_dtregister_fields.id"+
              "  WHERE  "+config.prefix+"_dtregister_field_event.event_id = ?";
    }

    remoteConnection.query(sql, vars, function(err, rows) {
        if (err) throw err;
        console.log(rows.length);
        checkEventFields(rows, 0);
    });
}

var updateEventFields = function(fields, index, fieldExists) {
    var fieldExists = fieldExists || false,
        sql = "",
        totalFields = fields.length,
        index = index || 0
        field = fields[index];

    if (fieldExists) {
        sql = "UPDATE event_fields SET ? WHERE event_id = '"+config.uuid+"' AND local_id = "+field.id;
        field["local_id"] = field["id"];
        delete field["id"];
    } else {
        sql = "INSERT INTO event_fields SET ?";
        field["local_id"] = field["id"];
        field["id"] = null;
    }
    /**
    if (eventExists) {
        sql = "UPDATE event SET ? WHERE eventId = '"+event.eventId+"'";
    } else {
        sql = "INSERT INTO event SET ?";
    }
    **/


    field["local_event_id"] = field["event_id"];
    field["event_id"] = config.uuid;
    localConnection.query(sql, field, function(err, result) {
        if (err) throw err;
        console.log(result);
        index++;
        if (fields.length < (index + 1)) {
            getEventDetails();
        } else {
            checkEventFields(fields, index);
        }
    });
}

var checkEventFields = function(fields, index) {
    var sql = "",
        totalFields = fields.length,
        index = index || 0;
    var vars = [parseInt(fields[index]["id"]), config.uuid];
    sql = "SELECT * FROM event_fields WHERE local_id = ? AND event_id = ?";
    localConnection.query(sql, vars, function(err, rows) {
        if (err) throw err;
        //console.log(result);
        var fieldExists = (rows.length > 0) ? true : false;
        updateEventFields(fields, index, fieldExists);
    });

}

var getEventDetails = function() {
    var sql = "SELECT *"+
              "  FROM "+config.prefix+"_dtregister_event_detail"+
              "  WHERE slabId = ?",
        vars = [config.remoteEventId];

    remoteConnection.query(sql, vars, function(err, rows) {
        if (err) throw err;
        console.log(rows.length);
        checkEventDetails(rows, 0);
    });
}

var checkEventDetails = function(details, index) {
    var sql = "",
        totalDetails = details.length,
        index = index || 0;
    var vars = [parseInt(details[index]["id"]), config.uuid];
    sql = "SELECT * FROM event_detail WHERE local_id = ? AND event_id = ?";
    localConnection.query(sql, vars, function(err, rows) {
        if (err) throw err;
        //console.log(result);
        var detailExists = (rows.length > 0) ? true : false;
        updateEventDetails(details, index, detailExists);
    });

}

var updateEventDetails = function(details, index, detailExists) {
    var detailExists = detailExists || false,
        sql = "",
        totalFields = details.length,
        index = index || 0
        detail = details[index];

    if (detailExists) {
        sql = "UPDATE event_detail SET ? WHERE event_id = '"+config.uuid+"' AND local_id = "+detail.id;
        detail["local_id"] = detail["id"];
        delete detail["id"];
    } else {
        sql = "INSERT INTO event_detail SET ?";
        detail["local_id"] = detail["id"];
        detail["id"] = null;
    }
    detail["event_id"] = config.uuid;
    localConnection.query(sql, detail, function(err, result) {
        if (err) throw err;
        console.log(result);
        index++;
        if (details.length < (index + 1)) {
            getEventCodes();
        } else {
            checkEventDetails(details, index);
        }
    });
}

var getEventCodes = function() {
    var sql = "SELECT "+config.prefix+"_dtregister_codes.*, "+config.prefix+"_dtregister_events_codes.event_id"+
        " FROM "+config.prefix+"_dtregister_events_codes"+
        " LEFT JOIN "+config.prefix+"_dtregister_codes ON "+config.prefix+"_dtregister_events_codes.discount_code_id = "+config.prefix+"_dtregister_codes.id"+
        " WHERE "+config.prefix+"_dtregister_events_codes.event_id = ?",
        vars = [config.remoteEventId];

    remoteConnection.query(sql, vars, function(err, rows) {
        if (err) throw err;
        console.log(rows.length);
        checkEventCodes(rows, 0);
    });
}

var checkEventCodes = function(codes, index) {
    var sql = "",
        totalCodes = codes.length,
        index = index || 0;
    var vars = [parseInt(codes[index]["id"]), config.uuid];
    sql = "SELECT * FROM event_codes WHERE local_id = ? AND event_id = ?";
    localConnection.query(sql, vars, function(err, rows) {
        if (err) throw err;
        //console.log(result);
        var codeExists = (rows.length > 0) ? true : false;
        updateEventCodes(codes, index, codeExists);
    });

}

var updateEventCodes = function(codes, index, codeExists) {
    var codeExists = codeExists || false,
        sql = "",
        totalFields = codes.length,
        index = index || 0
        code = codes[index];

    if (codeExists) {
        sql = "UPDATE event_codes SET ? WHERE event_id = '"+config.uuid+"' AND local_id = "+code.id;
        code["local_id"] = code["id"];
        delete code["id"];
    } else {
        sql = "INSERT INTO event_codes SET ?";
        code["local_id"] = code["id"];
        code["id"] = null;
    }
    code["local_event_id"] = code["event_id"];
    code["event_id"] = config.uuid;
    localConnection.query(sql, code, function(err, result) {
        if (err) throw err;
        console.log(result);
        index++;
        if (codes.length < (index + 1)) {
            end();
        } else {
            checkEventCodes(codes, index);
        }
    });
}

var end = function() {
    remoteConnection.end();
    localConnection.end();
};

checkEventExists();
