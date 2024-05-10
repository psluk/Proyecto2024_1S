-- ActivityTypes definition

CREATE TABLE ActivityTypes
(
    activityTypeId INTEGER
        primary key autoincrement,
    name           TEXT,
    hasStudents    INTEGER
);


-- CourseExperiences definition

CREATE TABLE CourseExperiences
(
    courseExperienceId INTEGER
        primary key autoincrement,
    name               TEXT
);


-- CourseTypes definition

CREATE TABLE CourseTypes
(
    courseTypeId INTEGER
        primary key autoincrement,
    name         TEXT
);


-- Groups definition

CREATE TABLE Groups
(
    groupId     INTEGER
        primary key autoincrement,
    groupNumber INTEGER,
    classroom   TEXT
);


-- ProfessorTypes definition

CREATE TABLE ProfessorTypes
(
    professorTypeId INTEGER
        primary key autoincrement,
    typeName        TEXT
);


-- Students definition

CREATE TABLE Students
(
    studentId    INTEGER
        primary key autoincrement,
    name         TEXT,
    phoneNumber  INTEGER,
    email        TEXT,
    universityId INTEGER,
    isEnabled    INTEGER
);


-- UserTypes definition

CREATE TABLE UserTypes
(
    userTypeId INTEGER
        primary key autoincrement,
    typeName   TEXT
);


-- Activities definition

CREATE TABLE Activities
(
    activityId     INTEGER
        primary key autoincrement,
    activityTypeId INTEGER
        references ActivityTypes,
    name           TEXT,
    hours          INTEGER,
    students       INTEGER,
    load           REAL
);


-- Courses definition

CREATE TABLE Courses
(
    courseId     INTEGER
        primary key autoincrement,
    courseTypeId INTEGER
        references CourseTypes,
    code         TEXT,
    name         TEXT,
    hours        INTEGER
);


-- ExperienceFactors definition

CREATE TABLE ExperienceFactors
(
    experienceFactorId INTEGER
        primary key autoincrement,
    courseExperienceId INTEGER
        references CourseExperiences,
    courseTypeId       INTEGER
        references CourseTypes
, factor REAL);


-- GroupProfessors definition

CREATE TABLE GroupProfessors
(
    groupProfessorId INTEGER
        primary key autoincrement,
    groupId          INTEGER
        references Groups,
    professorId      INTEGER,
    isModerator      INTEGER
);


-- GroupStudents definition

CREATE TABLE GroupStudents
(
    groupStudentId INTEGER
        primary key autoincrement,
    groupId        INTEGER
        references Groups,
    studentId      INTEGER
        references Students
);


-- Presentations definition

CREATE TABLE Presentations
(
    presentationId INTEGER
        primary key autoincrement,
    studentId      INTEGER
        references Students,
    classroom      TEXT,
    startTime      INTEGER,
    minuteDuration INTEGER
);


-- Professors definition

CREATE TABLE Professors
(
    professorId     INTEGER
        primary key autoincrement,
    professorTypeId INTEGER
        references ProfessorTypes,
    name            TEXT,
    email           TEXT
);


-- StudentFactors definition

CREATE TABLE StudentFactors
(
    studentFactorId INTEGER
        primary key autoincrement,
    courseTypeId    INTEGER
        references CourseTypes,
    minStudents     INTEGER,
    minHours        INTEGER,
    factor          REAL
);


-- StudentProfessors definition

CREATE TABLE StudentProfessors
(
    studentProfessorId INTEGER
        primary key autoincrement,
    professorId        INTEGER
        references Professors,
    studentId          INTEGER
        references Students,
    isAdvisor          INTEGER
);


-- Users definition

CREATE TABLE Users
(
    userId     INTEGER
        primary key autoincrement,
    userTypeId INTEGER
        references UserTypes,
    name       TEXT,
    email      TEXT,
    password   TEXT
);


-- ActivityCourses definition

CREATE TABLE ActivityCourses
(
    activityId         INTEGER
        primary key
        references Activities,
    courseId           INTEGER
        references Courses,
    studentFactorId    INTEGER
        references StudentFactors,
    courseExperienceId INTEGER
        references CourseExperiences
);


-- ProfessorActivities definition

CREATE TABLE ProfessorActivities
(
    professorActivityId INTEGER
        primary key autoincrement,
    activityId          INTEGER
        references Activities,
    professorId         INTEGER
        references Professors
);

-- Hardcoded data

INSERT INTO CourseExperiences (name) VALUES
	 ('New'),
	 ('Existing'),
	 ('Taught before'),
	 ('Parallel 1'),
	 ('Parallel 2');
INSERT INTO CourseTypes (name) VALUES
	 ('Theoretical'),
	 ('Practical'),
	 ('Theoretical-Practical'),
	 ('Project');
INSERT INTO ExperienceFactors (courseExperienceId,courseTypeId,factor) VALUES
	 (1,1,2.5),
	 (2,1,2.0),
	 (3,1,1.75),
	 (4,1,1.5),
	 (5,1,1.25),
	 (1,2,2.0),
	 (2,2,1.75),
	 (3,2,1.5),
	 (4,2,1.25),
	 (5,2,1.0);
INSERT INTO ExperienceFactors (courseExperienceId,courseTypeId,factor) VALUES
	 (1,4,3.0),
	 (2,4,2.5),
	 (3,4,2.0),
	 (4,4,1.5),
	 (5,4,1.25);
INSERT INTO ProfessorTypes (typeName) VALUES
	 ('Permanent'),
	 ('Temporary');
INSERT INTO StudentFactors (courseTypeId,minStudents,minHours,factor) VALUES
	 (1,1,2,2.0),
	 (1,16,2,3.0),
	 (1,26,2,4.0),
	 (1,36,2,5.0),
	 (1,46,2,6.0),
	 (1,1,5,2.75),
	 (1,16,5,3.75),
	 (1,26,5,4.75),
	 (1,36,5,5.75),
	 (1,46,5,6.75);
INSERT INTO StudentFactors (courseTypeId,minStudents,minHours,factor) VALUES
	 (2,1,0,3.0),
	 (2,16,0,4.5),
	 (2,26,0,6.0),
	 (3,1,0,2.5),
	 (3,16,0,3.75),
	 (3,26,0,5.25),
	 (3,36,0,6.5);
INSERT INTO UserTypes (typeName) VALUES
	 ('Administrator'),
	 ('Professor'),
	 ('Student');


-- NEW COMMANDS (2024-04-26)

-- Add workload types

CREATE TABLE WorkloadTypes (
	workloadTypeId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	name TEXT
);

-- Add hardcoded data

INSERT INTO ActivityTypes(name, hasStudents)
VALUES ('course', 1), ('research', 0), ('special', 0), ('administrative', 0);

INSERT INTO WorkloadTypes(name)
VALUES ('normal'), ('extended'), ('double'), ('overload'), ('adHonorem');

-- Add group number to ActivityCourses
ALTER TABLE ActivityCourses
    ADD groupNumber INTEGER;

-- Add experience factors for Theoretical-Practical courses
INSERT INTO ExperienceFactors (courseExperienceId, courseTypeId, factor)
SELECT courseExperienceId, (
    SELECT CT2.courseTypeId
    FROM CourseTypes CT2
    WHERE CT2.name = 'Theoretical-Practical'
    ), (factor + 1.5)/2 as 'factor'
FROM ExperienceFactors EF
         JOIN main.CourseTypes CT on CT.courseTypeId = EF.courseTypeId
WHERE CT.name = 'Theoretical';

-- Add workloadTypeId to Activities
create table Activities_dg_tmp
(
    activityId     INTEGER
        primary key autoincrement,
    activityTypeId INTEGER
        references ActivityTypes,
    name           TEXT,
    hours          INTEGER,
    students       INTEGER,
    load           REAL,
    workloadTypeId integer
        references WorkloadTypes
);

insert into Activities_dg_tmp(activityId, activityTypeId, name, hours, students, load)
select activityId, activityTypeId, name, hours, students, load
from Activities;

drop table Activities;

alter table Activities_dg_tmp
    rename to Activities;

-- Remove ProfessorActivities table

drop table ProfessorActivities;

create table Activities_dg_tmp
(
    activityId     INTEGER
        primary key autoincrement,
    activityTypeId INTEGER
        references ActivityTypes,
    name           TEXT,
    hours          INTEGER,
    students       INTEGER,
    load           REAL,
    workloadTypeId integer
        references WorkloadTypes,
    professorId    integer
        references Professors
);

insert into Activities_dg_tmp(activityId, activityTypeId, name, hours, students, load, workloadTypeId)
select activityId, activityTypeId, name, hours, students, load, workloadTypeId
from Activities;

drop table Activities;

alter table Activities_dg_tmp
    rename to Activities;

-- Move groupNumber to Activities

create table ActivityCourses_dg_tmp
(
    activityId         INTEGER
        primary key
        references Activities,
    courseId           INTEGER
        references Courses,
    studentFactorId    INTEGER
        references StudentFactors,
    courseExperienceId INTEGER
        references CourseExperiences
);

insert into ActivityCourses_dg_tmp(activityId, courseId, studentFactorId, courseExperienceId)
select activityId, courseId, studentFactorId, courseExperienceId
from ActivityCourses;

drop table ActivityCourses;

alter table ActivityCourses_dg_tmp
    rename to ActivityCourses;

alter table Activities
    add groupNumber integer;

-- Add suggestedStudents to Activities

alter table Activities
    add suggestedStudents integer;

--- Update student factors to prevent errors

UPDATE StudentFactors
SET minStudents = 0
WHERE studentFactorId = 14;

UPDATE StudentFactors
SET minStudents = 0
WHERE studentFactorId = 1;

UPDATE StudentFactors
SET minStudents = 0
WHERE studentFactorId = 6;

UPDATE StudentFactors
SET minStudents = 0
WHERE studentFactorId = 11;

UPDATE StudentFactors
SET minHours = 0
WHERE studentFactorId = 2;

UPDATE StudentFactors
SET minHours = 0
WHERE studentFactorId = 3;

UPDATE StudentFactors
SET minHours = 0
WHERE studentFactorId = 5;

UPDATE StudentFactors
SET minHours = 0
WHERE studentFactorId = 4;

UPDATE StudentFactors
SET minHours = 0
WHERE studentFactorId = 1;
