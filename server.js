// dependencies
const mysql = require("mysql2");
const inquirer = require("inquirer");
require("console.table");

//mysql connection
const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "r1gBy1997",
  database: "cmsDB",
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  console.log("Employee Manager");
  // runs the app
  getInput();
});

// function which prompts the user for what action they should take
function getInput() {
  inquirer
    .prompt({
      type: "list",
      name: "task",
      message: "Would you like to do?",
      choices: [
        "View Employees",
        "View Employees by Department",
        "Add Employee",
        "Remove Employees",
        "Update Employee Role",
        "Add Role",
        "End",
      ],
    })
    .then(function ({ task }) {
      switch (task) {
        case "View Employees":
          getEmployees();
          break;

        case "View Employees by Department":
          getEmployeeByDepartment();
          break;

        case "Add Employee":
          addEmployees();
          break;

        case "Remove Employees":
          removeEmployees();
          break;

        case "Update Employee Role":
          updateEmployeeRole();
          break;

        case "Add Role":
          addNewRole();
          break;

        case "End":
          connection.end();
          break;
      }
    });
}

//View Employees/ READ all, SELECT * FROM
function getEmployees() {
  console.log("Viewing employees...\n");

  var query = `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
  FROM employee e
  LEFT JOIN role r
	ON e.role_id = r.id
  LEFT JOIN department d
  ON d.id = r.department_id
  LEFT JOIN employee m
	ON m.id = e.manager_id`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);
    console.log("Employees viewed!\n");

    getInput();
  });
}

//"View Employees by Department" / READ by, SELECT * FROM
// Make a department array
function getEmployeeByDepartment() {
  console.log("Viewing employees by department...\n");

  var query = `SELECT d.id, d.name, r.salary AS budget
  FROM employee e
  LEFT JOIN role r
	ON e.role_id = r.id
  LEFT JOIN department d
  ON d.id = r.department_id
  GROUP BY d.id, d.name`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const deptInput = res.map((data) => ({
      value: data.id,
      name: data.name,
    }));

    console.table(res);
    console.log("Department view succeed!\n");

    getDepartment(deptInput);
  });
}

// User choose the department list, then employees pop up
function getDepartment(deptInput) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "departmentId",
        message: "Which department would you choose?",
        choices: deptInput,
      },
    ])
    .then(function (answer) {
      console.log("answer ", answer.departmentId);

      var query = `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department 
  FROM employee e
  JOIN role r
	ON e.role_id = r.id
  JOIN department d
  ON d.id = r.department_id
  WHERE d.id = ?`;

      connection.query(query, answer.departmentId, function (err, res) {
        if (err) throw err;

        console.table("response ", res);
        console.log(res.affectedRows + "Employees are viewed!\n");

        getInput();
      });
    });
}

// Make a employee array
function addEmployees() {
  console.log("Inserting an employee!");

  var query = `SELECT r.id, r.title, r.salary 
      FROM role r`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const roleChoices = res.map(({ id, title, salary }) => ({
      value: id,
      title: `${title}`,
      salary: `${salary}`,
    }));

    console.table(res);
    console.log("RoleToInsert!");

    promptInsert(roleChoices);
  });
}

function promptInsert(roleChoices) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "first_name",
        message: "What is the employee's first name?",
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the employee's last name?",
      },
      {
        type: "list",
        name: "roleId",
        message: "What is the employee's role?",
        choices: roleChoices,
      },
    ])
    .then(function (answer) {
      console.log(answer);

      var query = `INSERT INTO employee SET ?`;
      // when finished prompting, insert a new item into the db with that info
      connection.query(
        query,
        {
          first_name: answer.first_name,
          last_name: answer.last_name,
          role_id: answer.roleId,
          manager_id: answer.managerId,
        },
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log(res.insertedRows + "Inserted successfully!\n");

          getInput();
        }
      );
    });
}

//"Remove Employees" / DELETE, DELETE FROM
// Make a employee array to delete
function removeEmployees() {
  console.log("Deleting an employee");

  var query = `SELECT e.id, e.first_name, e.last_name
      FROM employee e`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const deleteEmployeeChoices = res.map(({ id, first_name, last_name }) => ({
      value: id,
      name: `${id} ${first_name} ${last_name}`,
    }));

    console.table(res);
    console.log("ArrayToDelete!\n");

    promptDelete(deleteEmployeeChoices);
  });
}

// User choose the employee list, then employee is deleted
function promptDelete(deleteEmployeeChoices) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee do you want to remove?",
        choices: deleteEmployeeChoices,
      },
    ])
    .then(function (answer) {
      var query = `DELETE FROM employee WHERE ?`;
      // when finished prompting, insert a new item into the db with that info
      connection.query(query, { id: answer.employeeId }, function (err, res) {
        if (err) throw err;

        console.table(res);
        console.log(res.affectedRows + "Deleted!\n");

        getInput();
      });
    });
}

//"Update Employee Role" / UPDATE,
function updateEmployeeRole() {
  employeeArray();
}

function employeeArray() {
  console.log("Updating an employee");

  var query = `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
  FROM employee e
  JOIN role r
	ON e.role_id = r.id
  JOIN department d
  ON d.id = r.department_id
  JOIN employee m
	ON m.id = e.manager_id`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    const employeeChoices = res.map(({ id, first_name, last_name }) => ({
      value: id,
      name: `${first_name} ${last_name}`,
    }));

    console.table(res);
    console.log("employeeArray To Update!\n");

    roleArray(employeeChoices);
  });
}

function roleArray(employeeChoices) {
  console.log("Updating an role");

  var query = `SELECT r.id, r.title, r.salary 
  FROM role r`;
  let roleChoices;

  connection.query(query, function (err, res) {
    if (err) throw err;

    roleChoices = res.map(({ id, title, salary }) => ({
      value: id,
      title: `${title}`,
      salary: `${salary}`,
    }));

    console.table(res);
    console.log("roleArray to Update!\n");

    promptEmployeeRole(employeeChoices, roleChoices);
  });
}

function promptEmployeeRole(employeeChoices, roleChoices) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee do you want to set with the role?",
        choices: employeeChoices,
      },
      {
        type: "list",
        name: "roleId",
        message: "Which role do you want to update?",
        choices: roleChoices,
      },
    ])
    .then(function (answer) {
      var query = `UPDATE employee SET role_id = ? WHERE id = ?`;
      // when finished prompting, insert a new item into the db with that info
      connection.query(
        query,
        [answer.roleId, answer.employeeId],
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log(res.affectedRows + "Updated successfully!");

          getInput();
        }
      );
    });
}

//"Add Role" / CREATE: INSERT INTO
function addNewRole() {
  var query = `SELECT d.id, d.name, r.salary AS budget
    FROM employee e
    JOIN role r
    ON e.role_id = r.id
    JOIN department d
    ON d.id = r.department_id
    GROUP BY d.id, d.name`;

  connection.query(query, function (err, res) {
    if (err) throw err;

    // (callbackfn: (value: T, index: number, array: readonly T[]) => U, thisArg?: any)
    const deptInput = res.map(({ id, name }) => ({
      value: id,
      name: `${id} ${name}`,
    }));

    console.table(res);
    console.log("Department array!");

    getRoleInfo(deptInput);
  });
}

function getRoleInfo(deptInput) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "roleTitle",
        message: "Role title?",
      },
      {
        type: "input",
        name: "roleSalary",
        message: "Role Salary",
      },
      {
        type: "list",
        name: "departmentId",
        message: "Department?",
        choices: deptInput,
      },
    ])
    .then(function (answer) {
      var query = `INSERT INTO role SET ?`;

      connection.query(
        query,
        {
          title: answer.title,
          salary: answer.salary,
          department_id: answer.departmentId,
        },
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log("Role Inserted!");

          getInput();
        }
      );
    });
}