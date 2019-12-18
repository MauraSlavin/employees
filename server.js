// to access database
const mysql = require("mysql");
// to access my own modules
const sqlQueries = require('./Develop/js/sqlQueries');

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



//   displays table of all employees to the CD
sqlQueries.getAllEmployees(connection);
sqlQueries.displayTable(connection);
//  displays table of employees in a given dept
const dept = "Manufacturing systems";
// const dept = "Warehouse systems";
sqlQueries.getEmployeesByDept(dept, connection);
sqlQueries.displayTable(connection);

// ends the connection to the db
connection.end();
