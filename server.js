// to access database
const mysql = require("mysql");
// need path for filename paths
const path = require("path");
// to allow console.log-ing a table to the CLI
const cTable = require("console.table");

// need express to have a conversation with the user on the CLI
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
  query = "DELETE FROM allemployees WHERE dept <> ?  OR dept IS NULL;";
  connection.query(query, department, function(err, res) {
    if (err) throw err;
  });
}

function getEmployeesByMgr(mgr) {
  // get all employees
  getAllEmployees();

  // delete all employees except those in the given department
  query = "DELETE FROM allemployees WHERE manager <> ? OR manager IS NULL;";
  connection.query(query, mgr, function(err, res) {
    if (err) throw err;
  });
}

function displayTable() {
  // select table data to send to CLI
  let query = "SELECT * FROM allemployees;";
  connection.query(query, function(err, res) {
    if (err) throw err;

    // Sent stringified results to the CLI
    console.table(JSON.parse(JSON.stringify(res)));
  });
}


function insertEmployee(employee_input_obj) {
  // insert a new role

  // find the dept_id from the name and replace it in the object.
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
      first_name: manager_first,
    };

    const mgr_obj_last = {
      last_name: manager_last
    };

    const mgr_objs = [
        mgr_obj_first,
        mgr_obj_last
    ];

    // get the dept id from the departments table using the department name object
    let query = "SELECT id FROM employees WHERE ? AND ?;";
    console.log("Query:" + query); // for testing
    console.log("mgr_obj:"); // for testing
    console.log(mgr_objs);  // for testing
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

// update an employee's role
// const new_role = {
//   first_name: "Duane",
//   last_name: "Stewart",
//   role_name: "programmer"
// };
// sqlUpdates.updateEmployeeRole(new_role, connection);

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

  // get list of managers for "View employees by manager" & "Add a new employee"
  const mgrs = findMgrs();
  console.log("(In whatToDo) mgrs:");
  console.log(mgrs);

  // get list of roles (titles) for "Add a new employee"
  const roles = findRoles();
  console.log("(In whatToDo) roles:");
  console.log(roles);

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
      // choices: depts
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
      // choices: mgrs
      choices: ["Emil Pignetti", "Duane Stewart", "Jim Tyger"]
    },

    // Asks which role, if adding an employee
    {
      type: "list",
      name: "addRole",
      message: "What will be this new employee's title?",
      when: actionIs("Add an employee"),
      // choices: roles
      choices: [
        "programmer",
        "manager",
        "second line manager",
        "senior programmer"
      ]
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
        console.log("results.dept:");
        console.log(results.dept);

        getEmployeesByDept(results.dept);
        displayTable();
        break;

      case "View employees by manager":
        console.log("results.mgr:");
        console.log(results.mgr);

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




        fault: console.log(
          "not all action choices accounted for - see inquirer.then in server.js"
        );
    } // end of switch stmt

    // If the user says yes to another game, play again, otherwise quit the game
    // if (val.choice) {
    //   this.play();
    // } else {
    //   this.quit();
    // }
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

      console.log("res");
      console.log(res);
      const depts = JSON.parse(JSON.stringify(res));
      console.log("depts:");
      console.log(depts);
      let newDepts = [];
      depts.forEach(function(convert) {
        newDepts.push(convert["department_name"]);
      });
      console.log("newdepts:");
      console.log(newDepts);

      return newDepts;
    });
  } catch (error) {
    console.error(error);
  }
  // select table departments to get list of depts
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
      console.log("mgrs:");
      console.log(mgrs);
      let newMgrs = [];
      mgrs.forEach(function(convert) {
        newMgrs.push(convert["mgr_name"]);
      });
      console.log("newMgrs:");
      console.log(newMgrs);

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
      console.log("roles:");
      console.log(roles);
      let newRoles = [];
      roles.forEach(function(convert) {
        newRoles.push(convert["title"]);
      });
      console.log("newRoles:");
      console.log(newRoles);

      return newRoles;
    });
  } catch (error) {
    console.error(error);
  }
} // end of findRoles


// returns an array with two string elements, the first name and the last name
async function getMgrFirstLast(manager_full_name) {
  const query = "SELECT first_name, last_name FROM employees WHERE CONCAT(first_name, ' ', last_name) = ?;";
  try {
    await connection.query(query, manager_full_name, function(err, res) {
      if (err) throw err;

      console.log("res");
      console.log(res);
      const mgr_first_last = JSON.parse(JSON.stringify(res));
      console.log("mgr_first_last:");
      console.log(mgr_first_last[0]);
      
      return mgr_first_last[0];
    });
  } catch (error) {
    console.error(error);
  }
  // select table departments to get list of depts
} // end of findDepts



// Ask what to do
whatToDo();
// console.log("action:  ", action);

// ends the connection to the db
// connection.end();
