const inquirer = require('inquirer');
const sql = require('mysql2');
const colors = require('colors');
const cons = require('console.table');

console.log("\x1b[32m%s\x1b[0m", `
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

//startup kicks off below queries to feed the arrays above with starting data.
startUp();

//Queries that should feed the above arrays | each works the same mostly looping through the result rows, taking the values needed, and pushing them into arrays
//depts query
function startUp() {
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
};
const mainQs = [
    {
        type: 'list',
        message: "What whould you like to do?".brightBlue ,
        name: 'landing',
        choices: 
    [
        'View Departments'.cyan,
        'View Job Profiles'.cyan,
        'View Employees'.cyan,
        'Add a Department'.cyan,
        'Add a Job Profile'.cyan,
        'Add an Employee'.cyan,
        'Update an Employees Profile'.cyan,
        'Exit'.red,
    ],
    },
    {
        type: 'input',
        message: "What is the name of the Department?",
        name: 'dept',
        when: (answers) => answers.landing === 'Add a Department'.cyan,
    },
    {
        type: 'list',
        message: "Which employee would you like to update?",
        name: 'empU',
        when: (answers) => answers.landing === 'Update an Employees Profile'.cyan,
        choices: employees
    },
    {
        type: 'list',
        message: "Are you sure you would like to exit?",
        name: 'exit',
        when: (answers) => answers.landing === 'Exit'.red,
        choices: ['Yes', 'No']
    },
];

const jobpQs = () => {
    inquirer
        .prompt([
            {
                type: 'input',
                message: "What is the name of this job profile?",
                name: 'jobp',
            },
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
])
init();
};

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

//function that shows job profiles
const viewJob = () => {
startUp();

conn.query(
    `SELECT jobprofile.id AS ID, jobprofile.title AS Title, department.dept_name AS Department, jobprofile.salary AS Salary
    FROM jobprofile JOIN department ON jobprofile.department_id = department.id`,
(err, res) => {
    if (err) throw err;
    console.table(res);

init();
});
};

//function that shows employees
const viewEmp = () => {
    startUp();
    
    conn.query(
        `SELECT employees.id AS ID, concat(employees.first_name, " " , employees.last_name) AS Name, jobprofile.title AS Title, department.dept_name AS Department, jobprofile.salary AS Salary,
        concat(manager.first_name, " " , manager.last_name) AS Manager
        FROM employees JOIN jobprofile ON employees.jobprofile_id = jobprofile.id JOIN department ON jobprofile.department_id = department.id LEFT JOIN employees manager ON employees.manager_id = manager.id`,
    (err, res) => {
        if (err) throw err;
        console.table(res);
    
    init();
    });
    };

function viewDept() {
    startUp();
    console.table(depts);
    init();
}

const init =  async () => {
    console.log('Welcome to the Employee Tracker!'.green)
    try {
        const answers = await inquirer.prompt(mainQs);
        if (answers.landing === 'Add a Job Profile'.cyan) {
            jobpQs();
            return;
        } else if (answers.emp === 'Add an Employee'.cyan) {
            empQs();
            return;
        } else if (answers.empU === 'Update an Employees Profile'.cyan) {
            return;
        } else if (answers.landing === 'View Departments'.cyan) {
            viewDept();
            return;
        } else if (answers.landing === 'View Job Profiles'.cyan) {
            viewJob();
            return;
        } else if (answers.landing === 'View Employees'.cyan) {
            viewEmp();
            return;
        }

        const answers2 = answers;
        if (answers2.exit === 'Yes') {
            console.log('You have quit the program.'.brightRed)
            process.exit();
        } else {
            init();
        }

    } catch (err) {
        return console.error(err);
    }
};

init();