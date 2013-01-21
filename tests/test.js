var http = require('http')
var assert = require('assert')
var mystream = require('../index.js')
var testcount = 0

var stm = mystream("Driver={SQL Server Native Client 11.0};Server=(local);Database=nodejstest;Trusted_Connection={Yes}", "dbo", "MOVIES", 1000)
stm.pipe(process.stdout);

