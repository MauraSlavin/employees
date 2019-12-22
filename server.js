// to access database
const mysql = require("mysql");
// need path for filename paths
const path = require("path");
// to allow console.log-ing a table to the CLI
const cTable = require("console.table");

// need express to have a conversation with the user on the CLI
const inquirer = require("inquirer");

// need to know whether to continue the app
let continueApp = true;
let depts = [];
let mgr_first_last;
let mgrs = [];
let employeeList = [];
let roles = [];

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
  if (err) console.log(err);
});

function getAllEmployees() {
  // clear out from old query to make sure we have current data
  let query = "DELETE FROM allemployees;";

  connection.query(query, function(err, res) {
    if (err) console.log(err);
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
    if (err) console.log(err);
  });

  // replace manager id number with the first and last name
  query = "UPDATE allemployees a, employees e";
  query += " SET a.manager = CONCAT(e.first_name, ' ', e.last_name)";
  query += " WHERE a.manager = e.id;";

  connection.query(query, function(err, res) {
    if (err) console.log(err);
  });
} // end getallemployees

function getEmployeesByDept(department) {
  // get all employees
  getAllEmployees();

  // delete all employees except those in the given department
  query = "DELETE FROM allemployees WHERE dept <> ?  OR dept IS NULL;";
  connection.query(query, department, function(err, res) {
    if (err) console.log(err);
  });
} // end of getemployeesbydept

function getEmployeesByMgr(mgr) {
  // get all employees
  getAllEmployees();

  // delete all employees except those in the given department
  query = "DELETE FROM allemployees WHERE manager <> ? OR manager IS NULL;";
  connection.query(query, mgr, function(err, res) {
    if (err) console.log(err);
  });
} // end of getemployeesbymgr

function displayTable() {
  // select table data to send to CLI
  let query = "SELECT * FROM allemployees;";
  connection.query(query, function(err, res) {
    if (err) console.log(err);
    // Sent stringified results to the CLI after a couple blank lines.
    console.log("\n\n");
    console.table(JSON.parse(JSON.stringify(res)));
  });
} // end of displaytable

// async function insertEmployee(employee_input_obj) {
//   // insert a new employee
//   console.log("employee_input_obj");
//   console.log(employee_input_obj);
//   // deconstruct the data we have
//   const {
//     first_name,
//     last_name,
//     role_name,
//     manager_first,
//     manager_last
//   } = employee_input_obj;

//   // need to create object with data needed to insert into the employees table
//   let employee_insert_obj = {
//     first_name: first_name,
//     last_name: last_name,
//     role_id: null, // to be retrieved from roles table based on role title
//     manager_id: null // to be retrieved from the employees table from the manager name
//   };

//   // use this object to do the SQL SELECT query (to get the role id for the job title)
//   const role_obj = {
//     title: role_name
//   };

//   // get the dept id from the departments table using the department name object
//   let query = "SELECT id FROM roles WHERE ?";
//   connection.query(query, role_obj, function(err, res) {
//     if (err) console.log(err);
//     // get the id from the res (result)
//     let role_id = JSON.parse(JSON.stringify(res));
//     role_id = role_id[0].id;
//     // replace the name in the role object to be inserted with the dept_id
//     employee_insert_obj.role_id = role_id;

//     // use this object to do the SQL SELECT query (to get the employee id for the manager)
//     const mgr_obj_first = {
//       first_name: manager_first
//     };

//     const mgr_obj_last = {
//       last_name: manager_last
//     };

//     const mgr_objs = [mgr_obj_first, mgr_obj_last];

//     // get the dept id from the departments table using the department name object
//     let query = "SELECT id FROM employees WHERE ? AND ?;";

//     connection.query(query, mgr_objs, function(err, res) {
//       if (err) console.log(err);
//       // get the id from the res (result)
//       let mgr_id = JSON.parse(JSON.stringify(res));
//       mgr_id = mgr_id[0].id;
//       // replace the name in the role object to be inserted with the dept_id
//       employee_insert_obj.manager_id = mgr_id;

//       // the object is now ready to be inserted in the table.
//       query = "INSERT INTO employees SET ?;";
//       connection.query(query, employee_insert_obj, function(
//         err,
//         res
//       ) {
//         if (err) console.log(err);
//       });

//       console.log(
//         "\nThe new employee " +
//           employee_insert_obj.first_name +
//           " " +
//           employee_insert_obj.last_name +
//           " has been successfully inserted."
//       );
//     });
//   });

//   console.log(sql);
// }

function deleteEmployee(emp_name) {
  // delete given employees
  query = "DELETE FROM employees WHERE CONCAT(first_name, ' ', last_name) = ?;";
  connection.query(query, emp_name, function(err, res) {
    if (err) console.log(err);
    console.log("\n\nemp_name" + " was successfully deleted.");
  });
}

function updateEmployeeRole(employee_name, new_role) {
  // update an employee's role
  // get the new role_id first
  // should only be one, but just in case, it'll take the first
  query = "SELECT id FROM roles WHERE title = ? LIMIT 1;";
  connection.query(query, new_role, function(err, res) {
    if (err) console.log(err);
    let new_role_id = JSON.parse(JSON.stringify(res));
    new_role_id = new_role_id[0].id;

    query =
      "UPDATE employees SET role_id = ? WHERE CONCAT(first_name, ' ', last_name) = ?;";

    connection.query(query, [new_role_id, employee_name], function(err, res) {
      if (err) console.log(err);
      console.log(
        "\n\n" +
          employee_name +
          "'s job title has been updated to " +
          new_role +
          "."
      );
    });
  });
} // end of updateemployeerole

function updateEmployeeMgr(employee_name, new_mgr) {
  // update an employee's manager

  // get the new manager_id first
  // should only be one, but just in case, it'll take the first
  query =
    "SELECT id FROM employees WHERE CONCAT(first_name, ' ', last_name) = ? LIMIT 1;";
  connection.query(query, new_mgr, function(err, res) {
    if (err) console.log(err);
    let new_mgr_id = JSON.parse(JSON.stringify(res));
    new_mgr_id = new_mgr_id[0].id;

    query =
      "UPDATE employees SET manager_id = ? WHERE CONCAT(first_name, ' ', last_name) = ?;";

    connection.query(query, [new_mgr_id, employee_name], function(err, res) {
      if (err) console.log(err);
      console.log(
        employee_name + "'s manager has been updated to " + new_mgr + "."
      );
    });
  });
} // end of updateemployeemgr

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

function whatToDo() {
  // initial question choices - what can the user do?
  const actionChoices = [
    "View all employees",
    "View employees by department",
    "View employees by manager",
    "Add an employee",
    "Remove an employee",
    "Update an employee's title",
    "Update an employee's manager",
    "Exit"
  ];

  // get list of depts for "View employees by dept"
  findDepts();

  // get list of managers for "View employees by manager" & "Add an employee"
  findMgrs();

  // get list of roles (titles) for "Add an employee"
  findRoles();

  // get list of employees for "Remove an employee"
  findEmployees();

  const questions = [
    // Asks initial question - what do you want to do
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: actionChoices
    },
    // Asks which dept, if viewing employees by dept
    {
      type: "list",
      name: "dept",
      message: "Which department would you like to see?",
      when: actionIs("View employees by department"),
      // choices: findDepts //  ******  this isn't returning the right thing, even though it looks the same ***** //
      choices: depts
    },

    // Asks which mgr, if viewing employees by dept
    {
      type: "list",
      name: "mgr",
      message: "Which manager would you like to see the employees for?",
      when: actionIs("View employees by manager"),
      // choices: mgrs
      choices: mgrs
    },

    // Asks employee first name, if adding an employee
    {
      type: "input",
      name: "addFirst",
      message: "What is the employee's first name?",
      when: actionIs("Add an employee")
    },

    // Asks employee last name, if adding an employee
    {
      type: "input",
      name: "addLast",
      message: "What is the employee's last name?",
      when: actionIs("Add an employee")
    },

    // Asks which mgr, if adding an employee
    {
      type: "list",
      name: "addMgr",
      message: "Which manager will this employee be working for?",
      when: actionIs("Add an employee"),
      // choices: mgrs          //  ******  this isn't returning the right thing, even though it looks the same ***** //
      choices: mgrs
    },

    // Asks which role, if adding an employee
    {
      type: "list",
      name: "addRole",
      message: "What will be this new employee's title?",
      when: actionIs("Add an employee"),
      // choices: roles        //  ******  this isn't returning the right thing, even though it looks the same ***** //
      choices: roles
    },

    // Asks which employee, if removing an employee
    {
      type: "list",
      name: "removeEmp",
      message: "Which employee would you like to fire?",
      when: actionIs("Remove an employee"),
      // choices: employeeList     //  ******  this isn't returning the right thing, even though it looks the same ***** //
      choices: employeeList
    },

    // Asks which employee, and the new role, if updating an employee's role
    {
      type: "list",
      name: "updateEmpForRole",
      message: "Which employee would you like to update the title for?",
      when: actionIs("Update an employee's title"),
      // choices: employeeList     //  ******  this isn't returning the right thing, even though it looks the same ***** //
      choices: employeeList
    },

    // Asks which employee, and the new role, if updating an employee's role
    {
      type: "list",
      name: "updateEmpRole",
      message: "What is the employee's new title?",
      when: actionIs("Update an employee's title"),
      // choices: roles        //  ******  this isn't returning the right thing, even though it looks the same ***** //
      choices: roles
    },

    // Asks which employee is getting a new manager (when updating the employee's manager)
    {
      type: "list",
      name: "updateEmpForNewMgr",
      message: "Which employee is getting a new manager?",
      when: actionIs("Update an employee's manager"),
      // choices: employeeList     //  ******  this isn't returning the right thing, even though it looks the same ***** //
      choices: employeeList
    },

    // Asks who the new manager is (when updating the employee's manager)
    {
      type: "list",
      name: "updateEmpNewMgr",
      message: "Who is the new manager?",
      when: actionIs("Update an employee's manager"),
      // choices: mgrs     //  ******  this isn't returning the right thing, even though it looks the same ***** //
      choices: mgrs
    },

    // Asks are you sure you want to exit?  Leaves if yes.
    {
      type: "confirm",
      name: "exitApp",
      message: "Are you sure you want to quit?",
      when: actionIs("Exit")
    }
  ];

  inquirer.prompt(questions).then(results => {
    // follow up questions based on inital answer...
    switch (results.action) {
      case "View all employees":
        getAllEmployees();
        // sqlQueries.getAllEmployees(connection);
        // sqlQueries.displayTable(connection);
        displayTable();
        break;

      // action = whatToDo();   // commented out for testing... put back in to reiterate application
      case "View employees by department":
        getEmployeesByDept(results.dept);
        displayTable();
        break;

      case "View employees by manager":
        getEmployeesByMgr(results.mgr);
        displayTable();
        break;

      // inserts a new employee
      case "Add an employee":
        insertNewEmployee(results);
        // get the manager's first & last name from the name entered.
        // getMgrFirstLast(results.addMgr);
        // console.log("(case Add an employee) mgr_first_last:");
        // console.log(mgr_first_last);
        // *******    Promise is pending.   WWWHHHYYY??  **********  //
        // console.log("line 435");
        // console.log(mgr_first_last);
        // const first_name = mgr_first_last[0].first_name;
        // const last_name = mgr_first_last[0].last_name;
        // // const mgr_first = "Jim";
        // // const mgr_last = "Tyger";
        // const employee_input_obj = {
        //   first_name: results.addFirst,
        //   last_name: results.addLast,
        //   role_name: results.addRole,
        //   manager_first: first_name,
        //   manager_last: last_name
        // };
        // insertEmployee(employee_input_obj);
        break;

      case "Remove an employee":
        deleteEmployee(results.removeEmp);
        break;

      case "Update an employee's title":
        updateEmployeeRole(results.updateEmpForRole, results.updateEmpRole);
        break;

      case "Update an employee's manager":
        updateEmployeeMgr(results.updateEmpForNewMgr, results.updateEmpNewMgr);
        break;

      case "Exit":
        // If the user doesn't want to leave, start over.  Otherwise, quit.
        if (results.exitApp) {
          // thank user
          console.log(
            "\nThank you for using 'Employee Manager'!  Have a good day."
          );
          continueApp = false;
          // close connection before leaving.
          connection.end();
        }
        break;

        fault: console.log(
          "\nNot all action choices accounted for - see inquirer.then in server.js."
        );
    } // end of switch stmt

    // start again with initial menu, when task is complete.
    if (continueApp) {
      whatToDo();
    }
  }); // end of .then block
}
// conversation.startConversation(connection);

// returns true if the action passed in matches the action entered
//   to determine what action-specific question to ask & action to take
function actionIs(action) {
  return function(answers) {
    return answers.action == action;
  };
}

// returns an array of strings, where each string is a dept name
async function findDepts() {
  // clear out from last query.
  depts = [];
  const query = "SELECT department_name FROM departments;";

  await connection.query(query, function(err, res) {
    if (err) console.log(err);

    for (let i = 0; i < res.length; i++) {
      depts.push(res[i].department_name);
    }
  });
} // end of findDepts

// returns an array of strings, where each string has a manager name
async function findMgrs() {
  // clear out from last query.
  mgrs = [];
  let query = "SELECT DISTINCT";
  query += " CONCAT(m.first_name, ' ', m.last_name)";
  query += " AS mgr_name";
  query += " FROM employees e";
  query += " INNER JOIN  employees m";
  query += " ON e.manager_id = m.id;";
  await connection.query(query, function(err, res) {
    if (err) console.log(err);

    for (let i = 0; i < res.length; i++) {
      mgrs.push(res[i].mgr_name);
    }
  });
} // end of findMgrs

// returns an array of strings, where each string has role (or title) name
async function findRoles() {
  // clear out from last query.
  roles = [];
  let query = "SELECT DISTINCT title FROM roles;";

  await connection.query(query, function(err, res) {
    if (err) console.log(err);

    for (let i = 0; i < res.length; i++) {
      roles.push(res[i].title);
    }
  });
} // end of findRoles

// returns an array with two string elements, the first name and the last name
async function insertNewEmployee(results) {
  // get manager first & last name, first
  console.log("\nStarting insertNewEmployee."); // test

  // need to create object with data needed to insert into the employees table
  let employee_insert_obj = {
    first_name: results.addFirst,
    last_name: results.addLast,
    role_id: null, // to be retrieved from roles table based on role title
    manager_id: null // to be retrieved from the employees table from the manager name
  };

  // need to get manager id and employee's role id, and put them in the employee_insert_obj.
  // then insert new record in database table

  // do query to get manager's first & last so we can get their id
  const query =
    "SELECT first_name, last_name FROM employees WHERE CONCAT(first_name, ' ', last_name) = ?";

  await connection.query(query, results.addMgr, function(err1, res1) {
    if (err1) console.log(err);

    // get the managers's id from the employees table to put in the new record as the employee's manager id
    let query =
      "SELECT id FROM employees WHERE first_name = ? AND last_name = ?;";
    connection.query(query, [res1[0].first_name, res1[0].last_name], function(err2, res2) {
      if (err2) console.log(err2);

      // put the manager's role id in the object to be inserted in the db for the new employee
      employee_insert_obj.manager_id = res2[0].id;

      // get the role id for the employee from the roles table
      let query = "SELECT id FROM roles WHERE title = ?;";
      console.log(
        "Check inputs to query.  This should be the role title of the new emp:  " + results.addRole); // test
      connection.query(query, results.addRole, function(err3, res3) {
        if (err3) console.log(err3);

        // replace the name in the role object to be inserted with the dept_id
        employee_insert_obj.role_id = res3[0].id;

        // //   Now we can insert the new employee
        // //     insertEmployee(employee_input_obj);

        console.log("employee_insert_obj:");
        console.log(employee_insert_obj);

        // the object is now ready to be inserted in the table.
        query = "INSERT INTO employees SET ?;";
        connection.query(query, employee_insert_obj, function(err4, res4) {
          if (err4) console.log(err4);

          console.log(
            "\n\nThe new employee " +
              employee_insert_obj.first_name +
              " " +
              employee_insert_obj.last_name +
              " has been successfully inserted."
          );
        });
      });
    });
  });
} // end of insertnewemployee

// // returns an array with two string elements, the first name and the last name
// async function getMgrFirstLast(manager_full_name) {
//   console.log("new console.log before query");
//   const query =
//     "SELECT first_name, last_name FROM employees WHERE CONCAT(first_name, ' ', last_name) = ?";

//   await connection.query(query, manager_full_name, function(err, res) {
//     if (err) console.log(err);
//     console.log("after query in getMgr...");
//     console.log(res[0]);
//     mgr_first_last = res[0];
//     let first_name = mgr_first_last.first_name;
//     let last_name = mgr_first_last.last_name;
//     const employee_input_obj = {
//       first_name: results.addFirst,
//       last_name: results.addLast,
//       role_name: results.addRole,
//       manager_first: first_name,
//       manager_last: last_name
//     };
//     console.log("at insertEmployee call");
//     console.log(employee_input_obj);
//     insertEmployee(employee_input_obj);
//     // return res;
//   });
// } // end of getMgrFirstLast

// returns an array of strings, where each string is an employee name (first & last)
async function findEmployees() {
  // clear out from last query.
  employeeList = [];
  const query =
    "SELECT CONCAT(first_name, ' ', last_name) as emp_name FROM employees;";

  await connection.query(query, function(err, res) {
    if (err) console.log(err);

    for (let i = 0; i < res.length; i++) {
      employeeList.push(res[i].emp_name);
    }
  });
} // end of findEmployees

// Ask what to do
whatToDo();
