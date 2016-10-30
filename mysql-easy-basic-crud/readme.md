# mysql-easy-basic-crud
mysql-easy-basic-crud is simple crud implemenation with node.js mysql driver.

## Installation
Install via npm.
> $ npm install --save mysql-easy-basic-crud

## Example

```javascript
"use strict";
const DBPool = require('mysql-easy-basic-crud');
const dbPool = new DBPool({
	connectionLimit: 20,
	host: 'localhost',
	port: 3306,
	user: 'test',
	password: 'test',
	database: 'test',
});

dbPool.create();

let pool = null;

dbPool.get()
.then((ins) => {
	pool = ins;
	return pool.table('Users').get();
})
.then((rows) => {
	console.log(rows);
})
.catch((err) => {
	console.error(err);
});
```


## API
### constructor DBPool(object dbConfig)
Create new DBPool instance. Possible options are [check node-mysql](https://github.com/mysqljs/mysql#pooling-connections). It uses mysql2 module internally.

### DBPool.create()
Create new pool.

### DBPool.end()
Release the pool. Be sure to call this before application ends.

### DBPool.get()
Get pool connection. Returning value is promise. Parameter passed by promise is DBPoolInstance type object which has plenty of utility functions.


### DBPoolInstance.release()
Release the connection.

### DBPoolInstance.table(string tblName)
Set the table you want to CRUD. This must be call before using CRUD methods.

### DBPoolInstance.exists(object where, object options)
Check matched data is exists in table.

### DBPoolInstance.count(object where, object options)
Count how many rows are in specified conditions. This method is useful for implementing paginating.

### DBPoolInstance.get(object where, object options)
Get matched row(s). Available options are:
- number page: Page number
- number pagePer: Number of how many records in one page.

### DBPoolInstance.create(object data, object options)
Create new record.

### DBPoolInstance.update(object where, object updateData, object options)
Update matched record(s).

### DBPoolInstance.delete(object where)
Delete matched record(s).

### DBPoolInstance.beginTransaction()
Begin the transaction.

### DBPoolInstance.commit()
Commit the transaction.

### DBPoolInstance.rollback()
Rollback the transaction.

### DBPoolInstance.query()
Execute normal SQL string.


## More Examples
### Get rows

```javascript
dbPool.get()
.then((conn) => {
	return conn.table('Users').get();
})
.then((rows) => {
	console.log(rows);
});
```

### Get rows with conditions

```javascript
dbPool.get()
.then((conn) => {
	return conn.table('Users').get({
		name: '.modernator'
	});
})
.then((rows) => {
	console.log(rows);
});
```

### Create record

```javascript
dbPool.get()
.then((conn) => {
	return conn.table('Users').create({
		userid: 'entvy',
		age: 25
	});
})
.then((result) => {
	console.log(result.insertId);
});
```

### Update matched records

```javascript
dbPool.get()
.then((conn) => {
	return conn.table('Users').update({
		userid: 'entvy'
	}, {
		age: 27
	});
});
```

### Remove matched records

```javascript
dbPool.get()
.then((conn) => {
	return conn.table('Users').delete({
		userid: 'entvy'
	});
});
```


## Future plans
- More complicated SQL jobs like join.
- Arithmetic comparison for querying
- Easy date comparison for querying
- Much more options may needed some specific conditions like LIMIT.
- CRUD Tables.
- Express friendly API


## License
MIT.