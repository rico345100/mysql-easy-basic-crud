"use strict";
const mysql = require('mysql2');

function convertObjectToWhereClause(obj, params) {
	let whereClause = [];

	for(let key in obj) {
		let value = obj[key];

		whereClause.push("`" + key + "` = ?");
		params.push(value);
	}

	return (" WHERE " + whereClause.join(" AND "));
}

function DBPool(dbConfig) {
	this.dbConfig = dbConfig || {};
	this.pool = null; 
}
DBPool.prototype.create = function() {
	this.pool = mysql.createPool(this.dbConfig);
	return this;
};
DBPool.prototype.get = function() {
	return new Promise((resolve, reject) => {
		this.pool.getConnection((err, conn) => {
			if(err) {
				return reject(new Error(err));
			}

			resolve(new DBPoolInstance(conn));
		});
	});
};
DBPool.prototype.end = function() {
	return new Promise((resolve, reject) => {
		this.pool.end((err) => {
			if(err) {
				return reject(new Error(err));
			}

			resolve();
		});
	});
};

function DBPoolInstance(conn) {
	this.conn = conn;
	this._table = '';
}
DBPoolInstance.prototype.release = function() {
	this.conn.release();
	return this;
};
DBPoolInstance.prototype.table = function(tableName) {
	this._table = tableName;
	return this;
};
DBPoolInstance.prototype.exists = function(where, options) {
	return new Promise((resolve, reject) => {
		options = options || {};

		let db = this.conn;
		let queryStr = "SELECT id FROM `" + this._table + "`";
		let params = [];

		if(where && typeof where === 'object' && Object.keys(where).length > 0) {
			queryStr += convertObjectToWhereClause(where, params);
		}

		let result = db.query(queryStr, params, (err, queryResult) => {
			if(err) {
				return reject(err);
			}

			resolve(queryResult.length > 0);
		});
	});
};
DBPoolInstance.prototype.count = function(where, options) {
	return new Promise((resolve, reject) => {
		options = options || {};

		let db = this.conn;
		let queryStr = "SELECT COUNT(id) AS rCount FROM `" + this._table + "`";
		let params = []; 

		if(where && typeof where === 'object' && Object.keys(where).length > 0) {
			queryStr += convertObjectToWhereClause(where, params);
		}

		let result = db.query(queryStr, params, (err, records) => {
			if(err) {
				return reject(err);
			}

			resolve(records[0].rCount);
		});
	});
};
DBPoolInstance.prototype.get = function(where, options) {
	return new Promise((resolve, reject) => {
		options = options || {};

		let db = this.conn;
		let queryStr = "SELECT * FROM `" + this._table + "`";
		let params = [];

		if(where && typeof where === 'object' && Object.keys(where).length > 0) {
			queryStr += convertObjectToWhereClause(where, params);
		}
		if(options.order) {
			let orderList = [];

			for(var field in options.order) {
				orderList.push(field + ' ' + (options.order[field] === 1 ? 'DESC' : 'ASC'));
			}

			let orderQuery = 'ORDER BY ' + (orderList.join(', '));
			queryStr += orderQuery;
		}
		
		if(options.page && options.pagePer) {
			let page = options.page || 1;
			let pagePer = options.pagePer;
			
			queryStr += ` LIMIT ${(page-1)*pagePer}, ${pagePer}`;
		}
		
		let result = db.query(queryStr, params, (err, records) => {
			if(err) {
				return reject(err);
			}

			resolve(records);
		});
	});
};
DBPoolInstance.prototype.create = function(data, options) {
	return new Promise((resolve, reject) => {
		options = options || {};

		let db = this.conn;
		let queryStr = "INSERT INTO `" + this._table + "` SET ?";

		let result = db.query(queryStr, [data], (err, queryResult) => {
			if(err) {
				return reject(err);
			}

			resolve(queryResult);
		});
	});
};
DBPoolInstance.prototype.update = function(where, data, options) {
	return new Promise((resolve, reject) => {
		options = options || {};

		let db = this.conn;
		let queryStr = "UPDATE `" + this._table + "` SET ?";
		let params = [data];

		if(where && typeof where === 'object' && Object.keys(where).length > 0) {
			queryStr += convertObjectToWhereClause(where, params);
		}

		let result = db.query(queryStr, params, (err, queryResult) => {
			if(err) {
				return reject(err);
			}
			
			return resolve(queryResult);
		});
	});
};
DBPoolInstance.prototype.delete = function(where, options) {
	return new Promise((resolve, reject) => {
		options = options || {};

		let db = this.conn;
		let queryStr = "DELETE FROM `" + this._table + "`";
		let params = [];

		if(where && typeof where === 'object' && Object.keys(where).length > 0) {
			queryStr += convertObjectToWhereClause(where, params);
		}

		let result = db.query(queryStr, params, (err, queryResult) => {
			if(err) {
				return reject(err);
			}

			resolve(queryResult);
		});
	});
};
DBPoolInstance.prototype.beginTransaction = function() {
	return new Promise((resolve, reject) => {
		this.conn.beginTransaction((err) => {
			if(err) {
				reject(err);
			}

			resolve();
		});
	});
};
DBPoolInstance.prototype.commit = function() {
	return new Promise((resolve, reject) => {
		this.conn.commit((err) => {
			if(err) {
				reject(err);
			}

			resolve();
		});
	});
};
DBPoolInstance.prototype.rollback = function() {
	return new Promise((resolve, reject) => {
		this.conn.rollback((err) => {
			if(err) {
				reject(err);
			}

			resolve();
		});
	});
};
DBPoolInstance.prototype.query = function(queryStr, params) {
	return new Promise((resolve, reject) => {
		params = params || [];

		let result = this.conn.query(queryStr, params, (err, queryResult) => {
			if(err) {
				return reject(err);
			}

			resolve(queryResult);
		});
	});
};

module.exports = DBPool;