// to access database
const mysql = require("mysql");
// to allow console.log-ing a table to the CDL
const cTable = require("console.table");

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

    console.log("\nThe new role " + new_role_obj.title + " has been successfully inserted.");
  });
}

exports.insertDepartment = insertDepartment;
exports.insertRole = insertRole;
