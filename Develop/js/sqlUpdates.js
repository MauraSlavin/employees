// to access database
const mysql = require("mysql");

function updateEmployeeRole(employee_obj, connection) {
  // update an employee's role, give the name and new role.
  // If the old role is a manager, it needs to cascade to NULLs
  //    so the db doesn't show someone as a manager who is no longer a manager.

  // In order to get the manager id of people working for this employee set to NULL,
  // I'll delete the manager with ON DELETE SET NULL (defined in the table);
  // Then insert the record for the employee with the new role.  I tried ON UPDATE SET NULL, but it didn't work
  // (could it be because I tried to use both ON DELETE SET NULL and ON UPDATE SET NULL??)

  // Get variables from the object passed in
  const { first_name, last_name, role_name } = employee_obj;
  var old_employee_obj = {}; // declare here so it will be available to change and insert new date later in this module.

  // need to get employee info so we don't lose other information besides role
  // then delete the employee, and insert it with the new role.

  // get the role id from the roles table using the role name passed in
  let query = "SELECT id FROM roles WHERE title = ?";
  connection.query(query, role_name, function(err, res) {
    if (err) throw err;
    // get the id from the res (result)
    let role_id = JSON.parse(JSON.stringify(res));
    role_id = role_id[0].id;

    // Now get the existing employee information
    query = "SELECT * FROM employees WHERE ? AND ?;";
    const employee_search = [
      {
        first_name: first_name
      },
      {
        last_name: last_name
      }
    ];

    connection.query(query, employee_search, function(err, res) {
      if (err) throw err;
      old_employee_obj = JSON.parse(JSON.stringify(res))[0];

      // delete the employee information
      query = "DELETE FROM employees WHERE ? AND ?;";
      connection.query(query, employee_search, function(err, res) {
        if (err) throw err;

        // update the old employee info with the new role id
        old_employee_obj.role_id = role_id;

        // insert the employee information with the new role.
        query = "INSERT INTO employees SET ?;";
        connection.query(query, old_employee_obj, function(err, res) {
          if (err) throw err;
        });
      });
    });

    console.log(
      "\n" +
        first_name +
        " " +
        last_name +
        "'s role has been successfully updated to " +
        role_name +
        "."
    );
  });
}

exports.updateEmployeeRole = updateEmployeeRole;
