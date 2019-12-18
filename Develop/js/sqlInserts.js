// to access database
const mysql = require("mysql");
// to allow console.log-ing a table to the CDL
const cTable = require("console.table");


function insertDepartment(dept_name, connection) {
      // insert a new department
  query = "INSERT INTO departments";
  query += " (department_name)";
  query += " VALUES (?);";
  connection.query(query, dept_name, function(err, res) {
    if (err) throw err;
  });
}

exports.insertDepartment = insertDepartment;