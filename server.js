// to access database
const mysql = require("mysql");
// need path for filename paths
const path = require("path");
// to allow console.log-ing a table to the CDL
const cTable = require("console.table");

// need express to have a conversation with the user on the CDL
const inquirer = require("inquirer");

// to access my own modules
// const sqlQueries = require("./Develop/js/sqlQueries");
// const sqlInserts = require("./Develop/js/sqlInserts");
// const sqlUpdates = require("./Develop/js/sqlUpdates");
// const conversation = require('./Develop/js/conversation');

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

function getAllEmployees(connection) {
  // clear out from old query to make sure we have current data
  let query = "DELETE FROM allemployees;";
  let err;
  // console.log("connection:"); // test
  // console.log(connection); // test

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

// // displays table of all employees to the CDL
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

function whatToDo(connection) {
  // initial question choices - what can the user do?
  const actionChoices = [
    "View all employees",
    "View employees by department",
    "View employees by manager",
    "Add an employee",
    "Remove an employee",
    "Update an employee's title",
    "Update an employee's manager",
    "End application"
  ];

  //   const whatToDo = () => {
  const questions = [
    // Asks initial question - what do you want to do
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: actionChoices
    },
    {
      type: "list",
      name: "displayByDept",
      message: "Which department would you like to see?",
      when: actionIs("View employees by department"),
      choices: ["Systems", "Inventory Control"]
      // choices: findDepts(connection);

    }
  ];

  inquirer.prompt(questions).then(val => {
    // follow up questions based on inital answer...

    if (val.action == "View all employees") {
      getAllEmployees(connection);
      // sqlQueries.getAllEmployees(connection);
       // sqlQueries.displayTable(connection);
      displayTable(connection);
      // action = whatToDo();   // commented out for testing... put back in to reiterate application
    }

    // If the user says yes to another game, play again, otherwise quit the game
    // if (val.choice) {
    //   this.play();
    // } else {
    //   this.quit();
    // }
  });
}
// conversation.startConversation(connection);


// returns true if the action passed in matches the action entered 
//   to determine what action-specific question to ask & action to take
function actionIs(action) {
  return function(answers) {
    return answers.action == action;
  };
}

// Ask what to do
whatToDo(connection);
// console.log("action:  ", action);

// ends the connection to the db
// connection.end();
