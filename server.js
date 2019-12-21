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
} // end getallemployees

function getEmployeesByDept(department) {
  // get all employees
  getAllEmployees();

  // delete all employees except those in the given department
  query = "DELETE FROM allemployees WHERE dept <> ?  OR dept IS NULL;";
  connection.query(query, department, function(err, res) {
    if (err) throw err;
  });
} // end of getemployeesbydept

function getEmployeesByMgr(mgr) {
  // get all employees
  getAllEmployees();

  // delete all employees except those in the given department
  query = "DELETE FROM allemployees WHERE manager <> ? OR manager IS NULL;";
  connection.query(query, mgr, function(err, res) {
    if (err) throw err;
  });
} // end of getemployeesbymgr

function displayTable() {
  // select table data to send to CLI
  let query = "SELECT * FROM allemployees;";
  connection.query(query, function(err, res) {
    if (err) throw err;
    // Sent stringified results to the CLI
    console.table(JSON.parse(JSON.stringify(res)));
  });
} // end of displaytable

function insertEmployee(employee_input_obj) {
  // insert a new employee

  // deconstruct the data we have
  const {
    first_name,
    last_name,
    role_name,
    manager_first,
    manager_last
  } = employee_input_obj;

  // need to create object with data needed to insert into the employees table
  let employee_insert_obj = {
    first_name: first_name,
    last_name: last_name,
    role_id: null, // to be retrieved from roles table based on role title
    manager_id: null // to be retrieved from the employees table from the manager name
  };

  // use this object to do the SQL SELECT query (to get the role id for the job title)
  const role_obj = {
    title: role_name
  };

  // get the dept id from the departments table using the department name object
  let query = "SELECT id FROM roles WHERE ?";
  connection.query(query, role_obj, function(err, res) {
    if (err) throw err;
    // get the id from the res (result)
    let role_id = JSON.parse(JSON.stringify(res));
    role_id = role_id[0].id;
    // replace the name in the role object to be inserted with the dept_id
    employee_insert_obj.role_id = role_id;

    // use this object to do the SQL SELECT query (to get the employee id for the manager)
    const mgr_obj_first = {
      first_name: manager_first
    };

    const mgr_obj_last = {
      last_name: manager_last
    };

    const mgr_objs = [mgr_obj_first, mgr_obj_last];

    // get the dept id from the departments table using the department name object
    let query = "SELECT id FROM employees WHERE ? AND ?;";

    connection.query(query, mgr_objs, function(err, res) {
      if (err) throw err;
      // get the id from the res (result)
      let mgr_id = JSON.parse(JSON.stringify(res));
      mgr_id = mgr_id[0].id;
      // replace the name in the role object to be inserted with the dept_id
      employee_insert_obj.manager_id = mgr_id;

      // the object is now ready to be inserted in the table.
      query = "INSERT INTO employees SET ?;";
      connection.query(query, employee_insert_obj, function(err, res) {
        if (err) throw err;
      });

      console.log(
        "\nThe new employee " +
          employee_insert_obj.first_name +
          " " +
          employee_insert_obj.last_name +
          " has been successfully inserted."
      );
    });
  });
}

function deleteEmployee(emp_name) {
  // delete given employees
  query = "DELETE FROM employees WHERE CONCAT(first_name, ' ', last_name) = ?;";
  connection.query(query, emp_name, function(err, res) {
    if (err) throw err;
    console.log(emp_name + " was successfully deleted.");
  });
}

function updateEmployeeRole(employee_name, new_role) {
  // update an employee's role
  // get the new role_id first
  // should only be one, but just in case, it'll take the first
  query = "SELECT id FROM roles WHERE title = ? LIMIT 1;";
  connection.query(query, new_role, function(err, res) {
    if (err) throw err;
    let new_role_id = JSON.parse(JSON.stringify(res));
    new_role_id = new_role_id[0].id;

    query =
      "UPDATE employees SET role_id = ? WHERE CONCAT(first_name, ' ', last_name) = ?;";

    connection.query(query, [new_role_id, employee_name], function(err, res) {
      if (err) throw err;
      console.log(
        employee_name + "'s job title has been updated to " + new_role + "."
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
    if (err) throw err;
    let new_mgr_id = JSON.parse(JSON.stringify(res));
    new_mgr_id = new_mgr_id[0].id;

    query =
      "UPDATE employees SET manager_id = ? WHERE CONCAT(first_name, ' ', last_name) = ?;";

    connection.query(query, [new_mgr_id, employee_name], function(err, res) {
      if (err) throw err;
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
  const depts = findDepts();
  console.log("(In whatToDo) depts:");
  console.log(depts);

  // get list of managers for "View employees by manager" & "Add an employee"
  const mgrs = findMgrs();
  console.log("(In whatToDo) mgrs:");
  console.log(mgrs);

  // get list of roles (titles) for "Add an employee"
  const roles = findRoles();
  console.log("(In whatToDo) roles:");
  console.log(roles);

  // get list of employees for "Remove an employee"
  const employeeList = findEmployees();
  console.log("(In whatToDo) employeeList:");
  console.log(employeeList);

  //   const whatToDo = () => {
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
      // choices: depts         //  ******  this isn't returning the right thing, even though it looks the same ***** //
      choices: ["Warehouse Systems", "Manufacturing Systems", "Systems"]
    },

    // Asks which mgr, if viewing employees by dept
    {
      type: "list",
      name: "mgr",
      message: "Which manager would you like to see the employees for?",
      when: actionIs("View employees by manager"),
      // choices: mgrs
      choices: ["Emil Pignetti", "Duane Stewart", "Jim Tyger"]
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
      choices: ["Emil Pignetti", "Duane Stewart", "Jim Tyger"]
    },

    // Asks which role, if adding an employee
    {
      type: "list",
      name: "addRole",
      message: "What will be this new employee's title?",
      when: actionIs("Add an employee"),
      // choices: roles        //  ******  this isn't returning the right thing, even though it looks the same ***** //
      choices: [
        "WS programmer",
        "WS manager",
        "WS senior programmer",
        "MS programmer",
        "MS manager",
        "MS senior programmer",
        "second line manager"
      ]
    },

    // Asks which employee, if removing an employee
    {
      type: "list",
      name: "removeEmp",
      message: "Which employee would you like to fire?",
      when: actionIs("Remove an employee"),
      // choices: employeeList     //  ******  this isn't returning the right thing, even though it looks the same ***** //
      choices: [
        "Maura Clifford",
        "Mike Slavin",
        "Jim Tyger",
        "Emil Pignetti",
        "Alyssa Quinn",
        "Duane Stewart",
        "A B"
      ]
    },

    // Asks which employee, and the new role, if updating an employee's role
    {
      type: "list",
      name: "updateEmpForRole",
      message: "Which employee would you like to update the title for?",
      when: actionIs("Update an employee's title"),
      // choices: employeeList     //  ******  this isn't returning the right thing, even though it looks the same ***** //
      choices: [
        "Maura Clifford",
        "Mike Slavin",
        "Jim Tyger",
        "Emil Pignetti",
        "Alyssa Quinn",
        "Duane Stewart",
        "A B"
      ]
    },

    // Asks which employee, and the new role, if updating an employee's role
    {
      type: "list",
      name: "updateEmpRole",
      message: "What is the employee's new title?",
      when: actionIs("Update an employee's title"),
      // choices: roles        //  ******  this isn't returning the right thing, even though it looks the same ***** //
      choices: [
        "WS programmer",
        "WS manager",
        "WS senior programmer",
        "MS programmer",
        "MS manager",
        "MS senior programmer",
        "second line manager"
      ]
    },

    // Asks which employee is getting a new manager (when updating the employee's manager)
    {
      type: "list",
      name: "updateEmpForNewMgr",
      message: "Which employee is getting a new manager?",
      when: actionIs("Update an employee's manager"),
      // choices: employeeList     //  ******  this isn't returning the right thing, even though it looks the same ***** //
      choices: [
        "Maura Clifford",
        "Mike Slavin",
        "Jim Tyger",
        "Emil Pignetti",
        "Alyssa Quinn",
        "Duane Stewart",
        "A B"
      ]
    },

    // Asks who the new manager is (when updating the employee's manager)
    {
      type: "list",
      name: "updateEmpNewMgr",
      message: "Who is the new manager?",
      when: actionIs("Update an employee's manager"),
      // choices: mgrs     //  ******  this isn't returning the right thing, even though it looks the same ***** //
      choices: ["Emil Pignetti", "Jim Tyger", "Duane Stewart"]
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
        // get the manager's first & last name from the name entered.
        mgr_first_last = getMgrFirstLast(results.addMgr);
        console.log("(case Add an employee) mgr_first_last:");
        console.log(mgr_first_last);
        // *******    Promise is pending.   WWWHHHYYY??  **********  //
        // const {mgr_first, mgr_last} = mgr_first_last;
        const mgr_first = "Jim";
        const mgr_last = "Tyger";
        const employee_input_obj = {
          first_name: results.addFirst,
          last_name: results.addLast,
          role_name: results.addRole,
          manager_first: mgr_first,
          manager_last: mgr_last
        };
        insertEmployee(employee_input_obj);
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
            "Thank you for using 'Employee Manager'!  Have a good day."
          );
          continueApp = false;
          // close connection before leaving.
          connection.end();
          
        };
        break;

        fault: console.log(
          "not all action choices accounted for - see inquirer.then in server.js"
        );
    } // end of switch stmt

    // start again with initial menu, when task is complete.
    if (continueApp) {
      whatToDo();
    };
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
  const query = "SELECT department_name FROM departments;";
  try {
    await connection.query(query, function(err, res) {
      if (err) throw err;

      const depts = JSON.parse(JSON.stringify(res));
      let newDepts = [];
      depts.forEach(function(convert) {
        newDepts.push(convert["department_name"]);
      });

      return newDepts;
    });
  } catch (error) {
    console.error(error);
  }
} // end of findDepts

// returns an array of strings, where each string has a manager name
async function findMgrs() {
  let query = "SELECT DISTINCT";
  query += " CONCAT(m.first_name, ' ', m.last_name)";
  query += " AS mgr_name";
  query += " FROM employees e";
  query += " INNER JOIN  employees m";
  query += " ON e.manager_id = m.id;";
  try {
    await connection.query(query, function(err, res) {
      if (err) throw err;

      const mgrs = JSON.parse(JSON.stringify(res));
      let newMgrs = [];
      mgrs.forEach(function(convert) {
        newMgrs.push(convert["mgr_name"]);
      });

      return newMgrs;
    });
  } catch (error) {
    console.error(error);
  }
} // end of findMgrs

// returns an array of strings, where each string has role (or title) name
async function findRoles() {
  let query = "SELECT DISTINCT title FROM roles;";
  try {
    await connection.query(query, function(err, res) {
      if (err) throw err;

      const roles = JSON.parse(JSON.stringify(res));

      let newRoles = [];
      roles.forEach(function(convert) {
        newRoles.push(convert["title"]);
      });

      return newRoles;
    });
  } catch (error) {
    console.error(error);
  }
} // end of findRoles

// returns an array with two string elements, the first name and the last name
async function getMgrFirstLast(manager_full_name) {
  const query =
    "SELECT first_name, last_name FROM employees WHERE CONCAT(first_name, ' ', last_name) = ?;";
  try {
    await connection.query(query, manager_full_name, function(err, res) {
      if (err) throw err;

      const mgr_first_last = JSON.parse(JSON.stringify(res));

      return mgr_first_last[0];
    });
  } catch (error) {
    console.error(error);
  }
  // select table departments to get list of depts
} // end of findDepts

// returns an array of strings, where each string is an employee name (first & last)
async function findEmployees() {
  const query =
    "SELECT CONCAT(first_name, ' ', last_name) as emp_name FROM employees;";
  try {
    await connection.query(query, function(err, res) {
      if (err) throw err;

      const emps = JSON.parse(JSON.stringify(res));

      let newEmps = [];
      emps.forEach(function(convert) {
        newEmps.push(convert["emp_name"]);
      });

      return newEmps;
    });
  } catch (error) {
    console.error(error);
  }
} // end of findEmployees

// Ask what to do
whatToDo();
