var sql = require('node-sqlserver'); 
module.exports = {
  parseldn: parseldn,
  setldn: setldn,
  saveldn: saveldn
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

function setldn(trackedtables, dbname, tblname, ldn)
{	
	var i = trackedtables.length;
    while (i--) {
       if ((trackedtables[i].database == dbname) &&  (trackedtables[i].name == tblname)){
			trackedtables[i].ldn = ldn;
			return true;
       }
    }
	//Put removal in here.
    return false;
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
	//winston.log('info', sqlcdc_databasecdc);
	var sqlcdc_stmt = sql.query(sqlcdc_conn_str, sqlcdc_databasecdc);
	sqlcdc_stmt.on('error', function (err) { //winston.log('error', "merge had an error. Have your created the sqlcdc database? " + err); 
	});
	sqlcdc_stmt.on('done', function () { 
		cb(); 
	});	
}
