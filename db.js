/** Database setup for BizTime. */

const { Client } = require("pg");

require('dotenv').config()

const PG_PASSWORD = process.env.PG_PASSWORD

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = `postgresql://postgres:${PG_PASSWORD}@localhost/biztime_test`;
} else {
  DB_URI = `postgresql://postgres:${PG_PASSWORD}@localhost/biztime`;
}

let db = new Client({
  connectionString: DB_URI
});

db.connect();

module.exports = db;