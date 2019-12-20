// // need express to have a conversation with the user on the CDL
// const inquirer = require("inquirer");

// // for inquirer
// // initial question choices - what can the user do?
// const actionChoices = [
//   "View all employees",
//   "View employees by department",
//   "View employees by manager",
//   "Add an employee",
//   "Remove an employee",
//   "Update an employee's title",
//   "Update an employee's manager"
// ];

// //   const whatToDo = () => {
// const questions = [
//   // Asks initial question - what do you want to do
//   {
//     type: "list",
//     name: "action",
//     message: "What would you like to do?",
//     choices: actionChoices
//   }
// ];

// function whatToDo() {
//   inquirer.prompt(questions).then(val => {
//     // follow up questions based on inital answer...

//     console.log(val);

//     // If the user says yes to another game, play again, otherwise quit the game
//     // if (val.choice) {
//     //   this.play();
//     // } else {
//     //   this.quit();
//     // }
//   });
// }

// // Ask what to do
// let action = whatToDo();

exports.conversation = conversation;
