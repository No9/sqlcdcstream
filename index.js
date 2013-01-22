var Stream = require('stream').Stream
var sql = require('msnodesql');

module.exports = function (conn_str, schema, tblname, interval) {
	    
		//Validate table exists
		var databasecdc = "SELECT sys.schemas.name, sys.tables.name AS tablename, sys.tables.create_date, sys.tables.modify_date, sys.tables.is_tracked_by_cdc, sys.tables.type_desc "
						  + "FROM sys.schemas INNER JOIN "
                          + "sys.tables ON sys.schemas.schema_id = sys.tables.schema_id where sys.tables.name = '" + tblname + "'"; 
		sql.open(conn_str, function (err, conn) {
			if (err) {
				throw new Error(err);
			}
			
			conn.queryRaw(databasecdc, function (err, results) {
				if (err) {
					throw new Error(err);
				}
				//console.log(results);
				if(results.rows.length == 0){
					throw new Error('Table : "' + tblname + '"  Does Not exist ');
				}
				
				if(results.rows[0][4] != 1){
				   throw new Error('Change Data Capture for ' + tblname + " is currently set to " + results.rows[0][4] + "\n Consider EXEC sys.sp_cdc_enable_table @source_schema, @source_name  @role_name");
				}
			});
		});
	
	
				
	
	var re = new RegExp("database=([^;]*);"); 
	var dbnameArray = conn_str.toLowerCase().match("database=([^;]*);");
	var dbnametotal = dbnameArray.join("").split(";");
	var dbname = dbnametotal[1]; 
	var sqlcdc_conn_str = conn_str.toLowerCase().replace(dbnametotal[0], "database=sqlcdc");
	console.log(sqlcdc_conn_str);
	var times = 0;
	var ldn = 0;
	
	
	var cdcdata = "SELECT * FROM tablestatus where tablename = '" + tblname + "' AND databasename = '" + dbname + "';";
	var stmt = sql.query(sqlcdc_conn_str, cdcdata);
		stmt.on('meta', function (meta) { });
		stmt.on('column', function (idx, data, more) { 
			if(idx == 2)
				ldn = parseldn(data);
			});
		stmt.on('done', function () {
			if(ldn == undefined){
				trkObj.ldn = 0;
			}
		});
		
		stmt.on('error', function (err) { throw new Error('error',"Error finding table status had an error :-( " + err); });
					
	var stream = new Stream();
	stream.readable = true		
	
	
	var iv = setInterval(function () {
		
		var databasecdc = "SELECT * FROM cdc." + schema + "_" + tblname + "_CT where __$start_lsn > " + ldn;
		var datagram = [];
		var metadata = [];
		var currentObject = {};
		var rowcount = 0;
		
		
		var stmt = sql.query(conn_str, databasecdc);

			stmt.on('meta', function (meta) { 
				metadata = meta;
			});
			stmt.on('row', function (idx) { 
					currentObject = {};
					rowcount++;
			});
			
			stmt.on('column', function (idx, data, more) { 
				
				if(idx == 0){
					ldn = parseldn(data);
				}
				currentObject[metadata[idx].name] = data;
				
				if(idx == (Object.keys(metadata).length - 1)){
							(function(currObj){
								saveldn(dbname, tblname, ldn, function(err){
									if(err){
										stream.emit('error', err);
										stream.close();
									}
									currentObject.tablename = tblname;
									stream.emit('data', JSON.stringify(currObj));
								});
							})(currentObject);
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

function parseldn(data)
{
	var tmpldn = "";
	for (ii = 0; ii < data.length; ii++) {
		var o = data.readUInt8(ii).toString(16);
		while(o.length < 2) o = "0" + o;
		tmpldn += o;
	}
	return "0x" + tmpldn;
}

function saveldn(dbname, tblname, ldn, cb){
	var sqlcdc_conn_str = "Driver={SQL Server Native Client 11.0};Server=(local);Database=sqlcdc;Trusted_Connection={Yes}"
    var sqlcdc_databasecdc = "MERGE INTO [sqlcdc].[dbo].[tablestatus]";
	sqlcdc_databasecdc += "USING (SELECT '" + dbname + "' AS dbname, '" + tblname + "' as tblname ) AS SRC ";
	sqlcdc_databasecdc += "ON tablestatus.databasename = SRC.dbname AND tablestatus.tablename = SRC.tblname ";
	sqlcdc_databasecdc += "WHEN MATCHED THEN UPDATE SET ";
	sqlcdc_databasecdc += "currentLSN = " + ldn + " ";
	sqlcdc_databasecdc += "WHEN NOT MATCHED THEN ";
	sqlcdc_databasecdc += "INSERT (databasename, tablename, currentLSN) ";
	sqlcdc_databasecdc += "VALUES (SRC.dbname, SRC.tblname, " + ldn + ");";
	
	var sqlcdc_stmt = sql.query(sqlcdc_conn_str, sqlcdc_databasecdc);
	sqlcdc_stmt.on('error', function (err) { 
		return cb(new Error("Can't divide by zero")); 
	});
	sqlcdc_stmt.on('done', function () { 
		cb(); 
	});	
}