const express = require("express");
const cors = require("cors");
const mongodb = require("mongodb");


const URL = "mongodb+srv://binaryblaze:1234@crud-collection.smm38.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const DB = "Student-MentorCRUD";

const app = express();
app.use(express.json());
app.use(cors());


// default page shows all the available urls for get and post
app.get("/", (req, res) => {
    res.send("\tWelcome to Student and Mentor Backend!!! \n\n Student Data : localhost:8080/students \n Mentor Data : localhost:8080/mentors \n Add Student : localhost:8080/add-student \n Add Mentor : localhost:8080/add-mentor \n Edit Student : localhost:8080/edit-student \n Edit Mentor : localhost:8080/edit-mentor \n Delete Student : localhost:8080/delete-student \n Delete Mentor : localhost:8080/delete-mentor \n Assign Students to a mentor : localhost:8080/assign-students \n Assign mentor to a student : localhost:8080/assign-mentor \n Find students by mentor_id : localhost:8080/find-students-by-mentor_id");
});



// get students data
app.get("/students", async (req, res) => {
    try {
        let connection = await mongodb.MongoClient.connect(URL);
        let db = connection.db(DB);
        let allStudents = await db.collection("students").find().toArray();
        await connection.close();

        res.status(200).json(allStudents);
    } catch (error) {
        res.status(500).send(error);
    }  
});

//get mentors data
app.get("/mentors", async (req, res) => {
    try {
        let connection = await mongodb.MongoClient.connect(URL);
        let db = connection.db(DB);
        let allMentors = await db.collection("mentors").find().toArray();
        await connection.close();

        res.status(200).json(allMentors);
    } catch (error) {
        res.status(500).send(error);
    }
});



// add a new student
app.post("/add-student", async (req, res) => {
    
    try {
        let connection = await mongodb.MongoClient.connect(URL);
        let db = connection.db(DB);
        await db.collection("students").insertOne(req.body);
        await connection.close();

        res.status(200).send(req.body.name + " added to students!");

    } catch (error) {
        res.status(500).send("Failed to add student " + req.body +  "! \n"+ error);
    }
});

// add a new mentor
app.post("/add-mentor", async (req, res) => {

    try {
        let connection = await mongodb.MongoClient.connect(URL);
        let db = connection.db(DB);
        await db.collection("mentors").insertOne(req.body);
        await connection.close();
        
        res.status(200).send(req.body.name + " added to mentors!");

    } catch (error) {
        res.status(500).send("Failed to add mentor " + req.body + "!\n" + error);
    }   
});



// update student
app.put("/edit-student/:id", async (req, res) => {

    try {
        let connection = await mongodb.MongoClient.connect(URL);
        let db = connection.db(DB);
        await db.collection("students").updateOne(
            { 
                _id : mongodb.ObjectID(req.params.id)
            },
            {
                $set : {
                    name : req.body.name,
                    roll : req.body.roll,
                    mentor_id : req.body.mentor_id
                }
            }
        );
        await connection.close();
        res.status(200).send(req.body.name + " edited successfully");

    } catch (error) {
        res.status(500).send(error);
    }
    
});

// update mentor
app.put("/edit-mentor/:id", async (req, res) => {
    
    try {
        let connection = await mongodb.MongoClient.connect(URL);
        let db = connection.db(DB);
        await db.collection("mentors").updateOne(
            { 
                _id : mongodb.ObjectID(req.params.id)
            },
            {
                $set : {
                    name : req.body.name,
                    students : req.body.students,
                }
            }
        );
        await connection.close();
        res.status(200).send(req.body.name + " edited successfully");

    } catch (error) {
        res.status(500).send(error);
    }
});



// delete student
app.delete("/delete-student/:id", async (req, res) => {
    
    try {
        let connection = await mongodb.MongoClient.connect(URL);
        let db = connection.db(DB);
        await db.collection("students").findOneAndDelete(
            {
                _id : mongodb.ObjectID(req.params.id)
            }
        );

        res.status(200).send("Student with id = " + req.params.id + " deleted successfully!");

    } catch (error) {
        res.status(500).send(error);
    }
});

// delete mentor
app.delete("/delete-mentor/:id", async (req, res) => {
    
    try {
        let connection = await mongodb.MongoClient.connect(URL);
        let db = connection.db(DB);
        await db.collection("mentors").findOneAndDelete(
            {
                _id : mongodb.ObjectID(req.params.id)
            }
        );

        res.status(200).send("Mentor with id = " + req.params.id + " deleted successfully!");

    } catch (error) {
        res.status(500).send(error);
    }
});



// assign students to mentor
app.put("/assign-students/:id", async (req, res) => {

    try {
        let connection = await mongodb.MongoClient.connect(URL);
        let db = connection.db(DB);
        await db.collection("mentors").updateOne(
            { 
                _id :  mongodb.ObjectID(req.params.id)
            },
            {
                $set : {
                    students : req.body.students,
                }
            }
        );

        res.status(200).send("Students list upgraded for mentor with id=" + req.params.id + " successfully!");
    
    } catch (error) {
        res.status(500).send(error);
    }
});



// assign a mentor to a student
app.put("/assign-mentor/:id", async (req, res) => {

    try {
        let connection = await mongodb.MongoClient.connect(URL);
        let db = connection.db(DB);
        await db.collection("students").updateOne(
            { 
                _id :  mongodb.ObjectID(req.params.id)
            },
            {
                $set : {
                    mentor_id : req.body.mentor_id
                }
            }
        );
        await db.collection("mentors").updateOne(
            { 
                _id : mongodb.ObjectID(req.body.mentor_id)
            },
            {
                $push : {
                    students : req.params.id
                }
            }
        );
        
        res.status(200).send(req.body.mentor_id + " assigned to " +  req.params.id + " successfully");

    } catch (error) {
        res.status(500).send(error);
    }
});



// Show students by mentor id
app.post("/find-students-by-mentor_id/:id", async (req, res) => {
    try {
        let connection = await mongodb.MongoClient.connect(URL);
        let db = connection.db(DB);
        let foundStudents = await db.collection("students").find(
            {
                mentor_id : req.params.id
            }
        ).toArray();
        
        res.status(200).send(foundStudents);

    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(8080);