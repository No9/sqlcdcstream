var Stream = require('stream').Stream
var sql = require('node-sqlserver');
var ldnmanager = require('./ldnmanager.js');

exports.changes = function (conn_str, tblname, interval) {
	var stream = new Stream();
	stream.readable = true	
		//Validate table exists
		var databasecdc = "SELECT sys.schemas.name, sys.tables.name AS tablename, sys.tables.create_date, sys.tables.modify_date, sys.tables.is_tracked_by_cdc, sys.tables.type_desc "
						  + "FROM sys.schemas INNER JOIN "
                          + "sys.tables ON sys.schemas.schema_id = sys.tables.schema_id where sys.tables.name = '" + tblname + "'"; 
		//console.log(databasecdc);
		sql.open(conn_str, function (err, conn) {
			if (err) {
				console.log(err);
				return null;
			}
			
			conn.queryRaw(databasecdc, function (err, results) {
				if (err) {
					console.log(err);
					return null;
				}
				//console.log(results);
				if(results.rows.length == 0){
				    console.log(databasecdc);
					throw new Error('Table : "' + tblname + '"  Does Not exist ');
				}
				
				if(results.rows[0][4] != 1){
				   throw new Error('Change Data Capture for ' + tblname + " is currently set to " + results.rows[0][4] + "\n Consider EXEC sys.sp_cdc_enable_table @source_schema, @source_name  @role_name");
				}
			});
		});
		
	//var databasecdc = "SELECT * FROM cdc." + tblname + " where __$start_lsn > " + ldn;
	var stream = new Stream();
	stream.readable = true	
	var times = 0;
	
	var iv = setInterval(function () {
		
		var dbname = "dbo";
		var databasecdc = "SELECT * FROM cdc.dbo_" + tblname + "_CT" ; // where __$start_lsn > " + ldn;
		var datagram = [];
		var metadata = [];
		var currentObject = {};
		var rowcount = 0;
		var ldn ;
		
		var stmt = sql.query(conn_str, databasecdc);
		console.log(databasecdc);
		console.log(databasecdc);
			
		console.log('Interval Fired')	
			stmt.on('meta', function (meta) { 
				console.log('Meta Data Retreived')
				metadata = meta;
			});
			stmt.on('row', function (idx) { 
					console.log('Row Fired')	
					currentObject = {};
					rowcount++;
			});
			
			stmt.on('column', function (idx, data, more) { 
				if(idx == 0){
					ldn = ldnmanager.parseldn(data);
				}
				currentObject[metadata[idx].name] = data;
				
				if(idx == (Object.keys(metadata).length - 1)){
					ldnmanager.saveldn(dbname, tblname, ldn, function(){
							
							currentObject.tablename = tblname;
							stream.emit('data', currentObject);
					});
				}
			});
				
			stmt.on('done', function () {
				
			});
			
			stmt.on('error', function (err) { 
				stream.emit('error', err);
			});
    }, interval);
	
   stream.end = function (data) {
	   if(data)
		stream.write(data);
		stream.emit('end');
	}

  stream.destroy = function () {
    stream.emit('close');
  }
  
  return stream;
  
}