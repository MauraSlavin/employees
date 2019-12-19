// to access database
const mysql = require("mysql");
// need express to interact with the front end
const express = require("express");
// need path for filename paths
const path = require("path");

// to access my own modules
const sqlQueries = require('./Develop/js/sqlQueries');
const sqlInserts = require('./Develop/js/sqlInserts');
const sqlUpdates = require('./Develop/js/sqlUpdates');

// Tells node that we are creating an "express" server
var app = express();
// Sets an initial port. We"ll use this later in our listener
var PORT = process.env.PORT || 8080;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// sets up the default directory to use in the html files
app.use(express.static(path.join(__dirname, "Develop/public")));

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


 // displays table of all employees to the CDL
// console.log("\n View All Employees:");
// sqlQueries.getAllEmployees(connection);
// sqlQueries.displayTable(connection);

//  displays table of employees in a given dept
// console.log("\n View Employees in a given Dept:");
// const dept = "Manufacturing systems";
// // const dept = "Warehouse systems";
// sqlQueries.getEmployeesByDept(dept, connection);
// sqlQueries.displayTable(connection);

// //  displays table of employees in a given role;
// console.log("\n View Employees in a given Role:");
// const role = "Programmer";
// sqlQueries.getEmployeesByRole(role, connection);
// sqlQueries.displayTable(connection);

// //  inserts a new department
// const new_dept = "Inventory Control";
// sqlInserts.insertDepartment(new_dept, connection);
// console.log("\n Inserted a new department: " + new_dept + ".");

//  inserts a new role
// const new_role = {
//   title: "Staff Programmer",
//   salary: 120000,
//   dept_id: "Systems"
// };
// sqlInserts.insertRole(new_role, connection);

// inserts a new employee
// const employee_input_obj = {
//   first_name: "Danielle",
//   last_name: "Slavin", 
//   role_name: "manager",
//   manager_first: "Emil",
//   manager_last: "Pignetti"
// };
// sqlInserts.insertEmployee(employee_input_obj, connection);

// update an employee's role
// const new_role = {
//   first_name: "Duane",
//   last_name: "Stewart",
//   role_name: "programmer"
// };
// sqlUpdates.updateEmployeeRole(new_role, connection);

// ends the connection to the db
// connection.end();

// If no matching route is found default to home
app.get("*", function(req, res) {
  res.sendFile(path.join(__dirname, "Develop/html/index.html"));
});


// start the server
app.listen(PORT, function() {
  console.log("App listening on PORT: " + PORT);
});