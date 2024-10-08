const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Secret key for JWT
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;

exports.handler = async (event) => {
  const token = event.headers.Authorization;
  try {
    const verified = jwt.verify(token, SECRET_KEY);
    const id = verified.id;
    const {iid} = event.body;
  const connection = await mysql.createConnection(dbConfig);

  try {
    const [rows] = await connection.execute('SELECT * FROM DOCKET_ITEMS WHERE iid = ?', [iid]);
    if (rows.length > 0) {
      return {
        status:200, success:true, dockets : rows
      };
    } else {
      return {
        status:200, message: 'No shipments found'
      };
    }
  } catch (error) {
    return {
      status:500, message: 'Error logging in', error: error.message
    };
  } finally {
    await connection.end();
  }
} catch (e) {
  return {
    status:400, message: 'Invalid Token' 
  };
}
};
