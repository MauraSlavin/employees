// to access database
const mysql = require("mysql");
// to allow console.log-ing a table to the CDL
const cTable = require("console.table");

function getAllEmployees(connection) {
  // clear out from old query to make sure we have current data
  let query = "DELETE FROM allemployees;";
  connection.query(query, function(err, res) {
    if (err) throw err;
  });

  // get data from joining employees & rol
  query =
    "INSERT INTO allemployees (id, first, last, title, dept, salary, manager)";
  query +=
    " SELECT employees.id, first_name, last_name, title, department_name, salary, manager_id";
  query += " FROM employees";
  query += " LEFT JOIN roles ON (employees.role_id = roles.id)";
  query += " LEFT JOIN departments ON (departments.id = roles.dept_id);";
  connection.query(query, function(err, res) {
    if (err) throw err;
  });

  // replace manager id number with the first and last name
  query = "UPDATE allemployees a, employees e";
  query += " SET a.manager = CONCAT(e.first_name, ' ', e.last_name)";
  query += " WHERE a.manager = e.id;";
  connection.query(query, function(err, res) {
    if (err) throw err;
  });

}

function getEmployeesByDept(department, connection) {
  // get all employees
  getAllEmployees(connection);

  // delete all employees except those in the given department
  query = "DELETE FROM allemployees WHERE dept <> ?;";
  connection.query(query, department, function(err, res) {
    if (err) throw err;
  });

}

function getEmployeesByRole(role, connection) {
  // get all employees
  getAllEmployees(connection);

  // delete all employees except those in the given department
  query = "DELETE FROM allemployees WHERE title <> ?;";
  connection.query(query, role, function(err, res) {
    if (err) throw err;
  });

}


function displayTable(connection) {
  // select table data to send to CDL
  let query = "SELECT * FROM allemployees;";
  connection.query(query, function(err, res) {
    if (err) throw err;

    // Sent stringified results to the CDL
    console.table(JSON.parse(JSON.stringify(res)));
  });
}

exports.getAllEmployees = getAllEmployees;
exports.getEmployeesByDept = getEmployeesByDept;
exports.getEmployeesByRole = getEmployeesByRole;
exports.displayTable = displayTable;