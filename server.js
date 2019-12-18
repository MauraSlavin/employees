// to access database
const mysql = require("mysql");

// to allow console.log-ing a table to the CDL
const cTable = require("console.table");

// set up connection to db
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "March14Freedom!",
  database: "employeedb"
});

// open connection to db
connection.connect(function(err) {
  if (err) throw err;
});

function getAllEmployees() {
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

function getEmployeesByDept(department) {
  // get all employees
  getAllEmployees();

  // delete all employees except those in the given department
  query = "DELETE FROM allemployees WHERE dept <> ?;";
  connection.query(query, department, function(err, res) {
    if (err) throw err;
  });

}

function displayTable() {
  // select table data to send to CDL
  let query = "SELECT * FROM allemployees;";
  connection.query(query, function(err, res) {
    if (err) throw err;

    // Sent stringified results to the CDL
    console.table(JSON.parse(JSON.stringify(res)));
  });
}

//   displays table of all employees to the CD
// getAllEmployees();
// displayTable();
//  displays table of employees in a given dept
const dept = "Manufacturing systems";
// const dept = "Warehouse systems";
getEmployeesByDept(dept);
displayTable();

// ends the connection to the db
connection.end();
