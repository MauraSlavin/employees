// to access database
const mysql = require("mysql");

function insertDepartment(dept_name, connection) {
  // insert a new department
  let query = "INSERT INTO departments";
  query += " (department_name)";
  query += " VALUES (?);";
  connection.query(query, dept_name, function(err, res) {
    if (err) throw err;
  });
}

function insertRole(new_role_obj, connection) {
  // insert a new role

  // find the dept_id from the name and replace it in the object.
  const dept_name = new_role_obj.dept_id;

  // use this object to do the SQL SELECT query (to get the id that the roles table needs)
  const dept_obj = {
    department_name: dept_name
  };

  // get the dept id from the departments table using the department name object
  let query = "SELECT id FROM departments WHERE ?";
  connection.query(query, dept_obj, function(err, res) {
    if (err) throw err;
    // get the id from the res (result)
    let new_id = JSON.parse(JSON.stringify(res));
    new_id = new_id[0].id;
    // replace the name in the role object to be inserted with the dept_id
    new_role_obj.dept_id = new_id;

    // the object is now ready to be inserted in the table.
    query = "INSERT INTO roles SET ?;";
    connection.query(query, new_role_obj, function(err, res) {
      if (err) throw err;
    });

    console.log(
      "\nThe new role " +
        new_role_obj.title +
        " has been successfully inserted."
    );
  });
}

function insertEmployee(employee_input_obj, connection) {
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

exports.insertDepartment = insertDepartment;
exports.insertRole = insertRole;
exports.insertEmployee = insertEmployee;
