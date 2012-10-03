sqlcdcstream
============

A stream of SQL Server Change Events

# Install 
```
npm install sqlcdcstream
```
# Usage

Enable SQL Server Change Data Capture on the Database
```
> osql -E 
1> USE NAME_OF_YOUR_DATABASE
2> GO
1> EXEC sys.sp_cdc_enable_db
2> GO
```

Enable Change Data Capture on a Table
```
> osql -E 
1> USE NAME_OF_YOUR_DATABASE
2> GO
1> EXECUTE sys.sp_cdc_enable_table 
	@source_schema = N'SCHEMA NAME E.G. dbo', 
	@source_name = N'TABLE_NAME', 
	@capture_instance = N'SCHEMA_NAME_TABLE_NAME'";
2> GO
```

Write a program to emit changes
```
var mystream = require('sqlcdc')
// where interval is the .
var connectionstring =  "Driver={SQL Server Native Client 11.0};Server=(local);Database=NAME_OF_DATABASE;Trusted_Connection={Yes}"
var schema = "dbo"
var tablename = "NAME_OF_TABLE"
var interval = 1000 //frequency the table is polled
var stm = mystream.changes(connectionstring, schema, tablename, interval);
```