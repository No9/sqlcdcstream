var http = require('http');
var assert = require('assert');
var mystream = require('./index.js');
var ldnmanager = require('./ldnmanager.js');
var testcount = 0;

//mystream.changes("Driver={SQL Server Native Client 11.0};Server=(local);Database=nodejstest;Trusted_Connection={Yes}", "NOT_A_TABLE", 1000);
//mystream.changes("Driver={SQL Server Native Client 11.0};Server=(local);Database=nodejstest;Trusted_Connection={Yes}", "systranschemas", 1000);
var stm = mystream.changes("Driver={SQL Server Native Client 11.0};Server=(local);Database=nodejstest;Trusted_Connection={Yes}", "MOVIES", 1000);


//assert.areequal(testcount, 1);
/*
var server = http.createServer(function (req, res) {
    var stream = mystream.changes("MOVIES", 1000);
    stream.on('error', function (err) {
        res.statusCode = 500;
        res.end(String(err));
    });
    stream.pipe(res);
});
server.listen(8000);*/