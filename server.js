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