const mysql = require("mysql2");
const inquirer = require("inquirer");
const cTable = require("console.table");

class Database {
  constructor(config) {
      this.connection = mysql.createConnection(config);
  }

  query(sql, args) {
      return new Promise((resolve, reject) => {
          this.connection.query(sql, args, (err, rows) => {
              if (err)
                  return reject(err);
              resolve(rows);
          });
      });
  }

  close() {
      return new Promise((resolve, reject) => {
          this.connection.end(err => {
              if (err)
                  return reject(err);
              resolve();
          });
      });
  }
}

const db = new Database({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "r1gBy1997",
  database: "cmsDB"
});

function runApp() {
  inquirer.prompt({
      name: "mainmenu",
      type: "list",
      message: "What would you like to do?",
      choices: [
          "View All Employees",
          "Edit Employeee Info",
          "View Roles",
          "Edit Roles",
          "View Departments",
          "Edit Departments",
          "Exit"
      ]
  }).then(responses => {
      switch (responses.mainmenu) {
          case "View All Employees":
              showEmployeeSummary();
              break;
          case "Edit Employeee Info":
              editEmployeeOptions();
              break;
          case "View Roles":
              showRoleSummary();
              break;
          case "Edit Roles":
              editRoleOptions();
              break;
          case "View Departments":
              showDepartments();
              break;
          case "Edit Departments":
              editDepartmentOptions();
              break;
          case "Exit":
              db.close();
              break;
      }
  });
}

// Builds complete employee table
async function showEmployeeSummary() {
  console.log(' ');
  await db.query('SELECT e.id, e.first_name AS First_Name, e.last_name AS Last_Name, title AS Title, salary AS Salary, name AS Department, CONCAT(m.first_name, " ", m.last_name) AS Manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role r ON e.role_id = r.id INNER JOIN department d ON r.department_id = d.id', (err, res) => {
      if (err) throw err;
      console.table(res);
      runApp();
  });
};

// Builds a table which shows existing roles and their departments
async function showRoleSummary() {
  console.log(' ');
  await db.query('SELECT r.id, title, salary, name AS department FROM role r LEFT JOIN department d ON department_id = d.id', (err, res) => {
      if (err) throw err;
      console.table(res);
      runApp();
  })
};

// Builds a table which shows existing departments
async function showDepartments() {
  console.log(' ');
  await db.query('SELECT id, name AS department FROM department', (err, res) => {
      if (err) throw err;
      console.table(res);
      runApp();
  })
};


// Called inside inquirers to check that the user isn't just trying to fill spots with empty space
async function confirmStringInput(input) {
  if ((input.trim() != "") && (input.trim().length <= 30)) {
      return true;
  }
  return "Invalid input. Please limit your input to 30 characters or less."
};

// Adds a new employee after asking for name, role, and manager
async function addEmployee() {
  let positions = await db.query('SELECT id, title FROM role');
  let managers = await db.query('SELECT id, CONCAT(first_name, " ", last_name) AS Manager FROM employee');
  managers.unshift({ id: null, Manager: "None" });

  inquirer.prompt([
      {
          name: "firstName",
          type: "input",
          message: "Enter employee's first name:",
          validate: confirmStringInput
      },
      {
          name: "lastName",
          type: "input",
          message: "Enter employee's last name:",
          validate: confirmStringInput
      },
      {
          name: "role",
          type: "list",
          message: "Choose employee role:",
          choices: positions.map(obj => obj.title)
      },
      {
          name: "manager",
          type: "list",
          message: "Choose the employee's manager:",
          choices: managers.map(obj => obj.Manager)
      }
  ]).then(answers => {
      let positionDetails = positions.find(obj => obj.title === answers.role);
      let manager = managers.find(obj => obj.Manager === answers.manager);
      db.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?)", [[answers.firstName.trim(), answers.lastName.trim(), positionDetails.id, manager.id]]);
      console.log("\x1b[32m", `${answers.firstName} was added to the employee database!`);
      runApp();
  });
};
