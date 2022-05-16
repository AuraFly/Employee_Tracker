const inquirer = require('inquirer');
const sql2 = require('mysql2');
const SQL = require('sql-template-strings')
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


const conn = sql2.createConnection({
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
        type: 'list',
        message: "Are you sure you would like to exit?",
        name: 'exit',
        when: (answers) => answers.landing === 'Exit'.red,
        choices: ['Yes', 'No']
    },
];

//Holds inquirer questions for employee update option, afterwards uses a .then to continue functions to put the
//profile id, first name, and last name into an update query, then sends it to SQL for the update.
const updQs = () => {
    inquirer
        .prompt([
            {
                type: 'list',
                message: "Which employee would you like to update?",
                name: 'empU',
                choices: employees
            },
            {
                type: 'list',
                message: "Which profile would you like to assign to this person?",
                name: 'empU1',
                choices: profiles
            },
        ])
        .then((res) => {
            let empName = `${res.empU}`;
            let eArr = empName.split(" ");
            let tid;
            
            conn.query(SQL`SELECT (id) FROM jobprofile WHERE title = ${res.empU1}`, (err, resp) => {
                if (err) throw err;
                tid = resp[0].id

                conn.query(SQL`UPDATE employees SET jobprofile_id = ${tid} WHERE first_name = ${eArr[0]} AND last_name = ${eArr[1]}`, (err, resp) => {
                    if (err) throw err;
                        console.error(err)
                        console.log('Employee has been updated!'.brightYellow);

            init()
            });
        });
    });
};

//Holds inquirer questions for department addition, afterwards uses a .then to continue functions to put the
//new department name into the table using the userInput array, even though there is only one object.
const deptQs = () => {
    inquirer
        .prompt([
            {
                type: 'input',
                message: "What is the name of the Department?",
                name: 'dept',
            },
        ])
        .then((res) => {
            let squery = "INSERT INTO department (dept_name) VALUES ?";
            let userInput = [
                [`${res.dept}`],
            ];

            conn.query(squery, [userInput], function(err) {
                if (err) throw err;
                });
                    console.log('New Department has been added!'.brightYellow);
                
            init();
        });
};



//Holds inquirer questions for job profile 'role' addition, afterwards uses a .then to continue functions to find the dId 'department id',
//then puts the title, salary, and department id into an array called userInput and passes that info to SQL.
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
.then((res) => {
let dId;
    conn.query(SQL`SELECT (id) FROM department WHERE dept_name = ${res.jobp2}`, (err, resp) => {
        if (err) throw err;
            dId = resp[0].id

            let squery = "INSERT INTO jobprofile (title, department_id, salary) VALUES ?";
            let userInput = [
                [`${res.jobp}`, dId, `${res.jobp1}`],
            ];

            conn.query(squery, [userInput], function(err) {
                if (err) throw err;
                });

                console.log('New profile has been added!'.brightYellow);

                init();
        })
    })
};

//Holds inquirere questions for employee addition, afterwards uses a .then to continue functions to find the PID and MID,
//then puts both plus the first name and last name into an array called userInput and passes that info to SQL.
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
                message: "What is the employee's job?",
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
.then((res) => {
let pid;
let mgrname = `${res.emp4}`;
let mArr = mgrname.split(" ");
let mid; 
    conn.query(SQL`SELECT (id) FROM jobprofile WHERE title = ${res.emp3} `, (err, resp) => {
        if (err) {
            console.error(err)
        };
            pid = resp[0].id;

        conn.query(`SELECT (id) FROM employees WHERE first_name=(?) AND last_name=(?)`, [mArr[0], mArr[1]], (err, re) => {
            if (err) {
                console.error(err)
            };
                mid = re[0].id;

let userInput = [
    [`${res.emp1}`, `${res.emp2}`, pid, mid],
];

let squery = "INSERT INTO employees (first_name, last_name, jobprofile_id, manager_id ) VALUES ?";

            conn.query(squery, [userInput], function(err) {
                if (err) throw err;
                });

console.log('Employee has been created!'.brightYellow)

init()
            });
        });
    });
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

//function that shows employees via a select query, then fires the questions again using init.
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

//simple function to view existing departments.
function viewDept() {
    startUp();
    console.table(depts);
    init();
};

const init =  async () => {
    try {
        console.log('Welcome to the Employee Tracker!'.green)
        const answers = await inquirer.prompt(mainQs);
        if (answers.landing === 'Add a Job Profile'.cyan) {
            jobpQs();
            return;
        } else if (answers.landing === 'Add an Employee'.cyan) {
            empQs();
            return;
        } else if (answers.landing === 'Add a Department'.cyan) {
            deptQs();
            return;
        } else if (answers.landing === 'Update an Employees Profile'.cyan) {
            updQs();
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