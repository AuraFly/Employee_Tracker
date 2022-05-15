const inquirer = require('inquirer');
const sql = require('mysql2');
const cons = require('console.table');

console.log(`
___________               __                              
/_   _____/ _____ ______ |  |   ____ ___ __  ____   ____  
 |    __)_ /     ||____ ||  |  /  _ <   |  |/ __ |_/ __ | 
 |        |  Y Y  |  |_> >  |_(  <_> )___  |  ___/|  ___/ 
/_______  /__|_|  /   __/|____/|____// ____||___  >|___  >
        |/      |/|__|               |/         |/     |/ 
___________                     __                        
|__    ___/___________    ____ |  | __ ___________        
  |    |  |_  __ |__  | _/ ___||  |/ // __ |_  __ |       
  |    |   |  | |// __ ||  |___|    <|  ___/|  | |/       
  |____|   |__|  (____  /|___  >__|_ ||___  >__|          
                      |/     |/     |/    |/              
=========================================================
`);


const conn = sql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password123',
    database: 'org_db'
});

//Arrays needed for containing SQL Data that Inquirer will use.
const depts = [];
const profiles = [];
const employees = [];
const mgrs = [];

//Queries that should feed the above arrays | each works the same mostly looping through the result rows, taking the values needed, and pushing them into arrays
//depts query
conn.query(`SELECT dept_name FROM department`, (err, res) => {
    if (err) throw err;
    res.forEach(function(row) {
        depts.push(row.dept_name);
    });
});

//roles query
conn.query(`SELECT title FROM jobprofile`, (err, res) => {
    if (err) throw err;
    res.forEach(function(row) {
        profiles.push(row.title);
    });
});
//employees query
conn.query(`SELECT first_name, last_name FROM employees`, (err, res) => {
    if (err) throw err;
    res.forEach(function(row) {
        employees.push(`${row.first_name} ${row.last_name}`);
    });
});
//mgrs query
conn.query(`SELECT first_name, last_name FROM employees WHERE manager_id IS NOT NULL`, (err, res) => {
    if (err) throw err;
    res.forEach(function(row) {
        mgrs.push(`${row.first_name} ${row.last_name}`);
    });
});

const mainQs = [
    {
        type: 'list',
        message: "What whould you like to do?",
        name: 'landing',
        choices: 
    [
        'View Departments',
        'View Job Profiles',
        'View Employees',
        'Update an Employees Profile',
        'Add a Department',
        'Add a Job Profile',
        'Add an Employee',
        'Exit',
    ],
    },
    {
        type: 'input',
        message: "What is the name of the Department?",
        name: 'dept',
        when: (answers) => answers.landing === 'Add a Department',
    },
    {
        type: 'input',
        message: "What is the name of this job profile?",
        name: 'jobp',
        when: (answers) => answers.landing === 'Add a Job Profile',
    },
    {
        type: 'input',
        message: "What is the name of the employee?",
        name: 'emp',
        when: (answers) => answers.landing === 'Add an Employee',
    },
    {
        type: 'list',
        message: "Which employee would you like to update?",
        name: 'empU',
        when: (answers) => answers.landing === 'Update an Employees Profile',
        choices: employees
    },
    {
        type: 'list',
        message: "Are you sure you would like to exit?",
        name: 'exit',
        when: (answers) => answers.landing === 'Exit',
        choices: ['Yes', 'No']
    },
];

const jobpQs = () => {
    inquirer
        .prompt([
            {
                type: 'number',
                message: "What is the salary of this job profile?",
                name: 'jobp1',
            },
            {
                type: 'list',
                message: "What department does this profile belong to?",
                name: "jobp2",
                choices: depts
            },
])};

const empQs = () => {
    inquirer
        .prompt([
            {
                type: 'input',
                message: "What is the employee's first name?",
                name: 'emp1',
            },
            {
                type: 'input',
                message: "What is the employee's last name?",
                name: 'emp2',
            },
            {
                type: 'list',
                message: "What is the employee's role?",
                name: "emp3",
                choices: profiles
            },
            {
                type: 'list',
                message: "Who is the employee's manager?",
                name: "emp4",
                choices: mgrs
            },
]) 
init()
};


const init =  async () => {
    console.log('Welcome to the Employee Tracker!')
    try {
        const answers = await inquirer.prompt(mainQs);
        if (answers.jobp !== '') {
            jobpQs();
            return;
        } else if (answers.emp !== '') {
            empQs();
            return;
        } else if (answers.empU !== '') {
            genInt(answers);
            return;
        } else if (answers.landing === 'View Departments') {
            viewDept();
            return;
        } else if (answers.landing === 'View Job Profiles') {
            viewJob(answers);
            return;
        } else if (answers.landing === 'View Employees') {
            viewEmp();
            return;
        }

        const answers2 = answers;
        if (answers2.exit === 'Yes') {
            console.log('You have quit the program.')
            conn.end();
        } else {
            init();
        }

    } catch (err) {
        return console.error(err);
    }
};

init();