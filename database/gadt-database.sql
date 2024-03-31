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