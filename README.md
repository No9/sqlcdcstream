sqlcdcstream
============

A stream of SQL Server Change Events

# Install 
```
npm install sqlcdcstream
```
# Usage

Enable SQL Server Change Data Capture on the Database
```sql
>osql -E 
1> USE NAME_OF_YOUR_DATABASE
2> GO
1> EXEC sys.sp_cdc_enable_db
2> GO
```

Enable Change Data Capture on a Table
```
1> USE NAME_OF_YOUR_DATABASE
2> GO
1> EXECUTE sys.sp_cdc_enable_table @source_schema = N'SCHEMA NAME E.G. dbo', @source_name = N'TABLE_NAME', @capture_instance = N'SCHEMA_NAME_TABLE_NAME'";
2> GO
```

Write a program to emit changes
```
var mystream = require('sqlcdc')
// Parameters are : connectionstring, schema, tblname, interval 
// where interval is the frequency of a poll. 
var stm = mystream.changes("Driver={SQL Server Native Client 11.0};Server=(local);Database=NAME_OF_DATABASE;Trusted_Connection={Yes}", "dbo", "MOVIES", 1000);
```




