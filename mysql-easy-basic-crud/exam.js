"use strict";
// const DBPool = require('mysql-easy-basic-crud');
const DBPool = require('./index');
const dbPool = new DBPool({
	connectionLimit: 20,
	host: 'localhost',
	port: 3306,
	user: 'module-test',
	password: 'module-test',
	database: 'module-test',
});

dbPool.create();

let pool = null;

// order by id
dbPool.get()
.then((ins) => {
	pool = ins;

	// Row query
	return pool.query("SELECT * FROM `Users`");
})
.then((rows) => {
	console.log(rows);
	return pool.beginTransaction();
})
.then(() => {
	console.log('Transaction began.');

	// return pool.table('Users').create({
	// 	userid: 'god',
	// 	name: 'Smidt',
	// 	age: 25
	// });
	// return pool.table('Users').update({
	// 	userid: 'entvy'
	// }, {
	// 	age: 72
	// });
	// return pool.table('Users').delete({
	// 	userid: 'god'
	// });
})
.then(() => {
	return pool.table('Users').get({}, {
		order: {
			id: 1	// order by id DESC
		}
	});
})
.then((rows) => {
	console.log(rows);
	console.log('Start commit...');

	// throw new Error('Intentional error for not commit!');

	return pool.commit();
})
.then(() => {
	console.log('Committed!');
})
.catch((err) => {
	console.error(err);
	console.log('Error occured! Rolling back...');
	return pool.rollback();
})
.then(() => {
	console.log('Every procedure is done!');

	pool.release();
	dbPool.end();
});