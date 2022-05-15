INSERT INTO department (dept_name)
VALUES 
    ('Client NOC'),
    ('Leveraged NOC'),
    ('Network Service Desk'),
    ('SRE'),
    ('Leadership');

INSERT INTO jobprofile (title, department_id, salary)
VALUES ('Network Analyst I', 1, 50000),
    ('Network Analyst II', 2, 70000),
    ('Network Analyst III', 3, 90000),
    ('Network Manager', 5, 90000),
    ('Senior Network Manager', 5, 120000),
    ('Site Reliability Engineer', 4, 80000),
    ('Site Reliability Specialist', 4, 100000),
    ('Ticket Flow Administrator', 3  , 70000);

INSERT INTO employees (first_name, last_name, jobprofile_id, manager_id)
VALUES ('Lance', 'Soda', 1, NULL),
    ('Andrew', 'Bacon', 2, 2),
    ('Paul', 'Risoto', 3, 3),
    ('Martin', 'Celery', 4, NULL),
    ('Tomasz', 'Maple', 5, NULL),
    ('Jordan', 'Carrot', 6, 1),
    ('Jamie', 'Mustard', 7, NULL),
    ('Randall', 'Salad', 8, NULL);