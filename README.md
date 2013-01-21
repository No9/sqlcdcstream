# sqlcdcstream

Is a node.js module that enables changes made to data an Microsoft SQL Server Database Table to be converted to a stream.

It captures all CRUD operations on a table and utilises the built in [Change Data Capture](http://msdn.microsoft.com/en-us/library/bb522489.aspx) functionality of SQL Server.

## Install 
```
npm install sqlcdcstream
```

If your database server does not currently have sqlcdcstream schema do either of the following
```
> node node-modules\sqlcdcstream\install-database.js
```

Or run the script sql\installsqlcdc.sql on the database server
```
> osql -E -n-1 -i .\sql\installsqlcdc.sql -o install-database.log
```

This creates a database on the local instance to store the id of the latest record.
You will find the output of these commands in install-database.log
The script will not delete the database if it already exists.

## Configuration

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

## Usage

Write a program to emit changes
```
var mystream = require('sqlcdc')
var connection =  "Driver={SQL Server Native Client 11.0};Server=(local);Database=DB_NAME;Trusted_Connection={Yes}"
var schema = "dbo"
var tablename = "NAME_OF_TABLE"
var interval = 1000 //frequency the table is polled
var stm = mystream.changes(connection, schema, tablename, interval);
stm.pipe(process.stdout);
```