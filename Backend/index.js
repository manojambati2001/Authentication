const express = require("express");
const mysql = require("mysql");
const cors=require('cors')
const app = express();
const jwt = require("jsonwebtoken");
app.use(express.json());

const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'Apple#123',
    database : 'Authentication'
})

db.connect(function(err){
    if(err){
        console.log("didn't connect to database");
        return;
    }
    console.log("Connected to database");
})
app.use(cors())

app.post("/", (req, res) => {
    const {name, user_name, email, password} = req.body;
    const getUser = "call get_user_on_user_name(?)"
    db.query(getUser, [user_name], (error, result) => {
        if(error){
            return res.send("Enter Correct details")
        }
        if(result[0][0] === undefined){
            const createUser = "call insert_user_details(?,?,?,?)"
            db.query(createUser,[name, user_name, email, password], (error2, result2) => {
                if (error2){
                    res.send("database problem")
                }
                res.status(201).send(result2);
            })
        } else {
            res.send("User already exists")
        }
    });
})

app.post("/login", async (req, res) => {
    const { user_name, password} = req.body;
    const getUser = "call get_user_on_user_name(?)"
    db.query(getUser, [user_name], (error, result) => {
        if(error){
            return res.send("Internal Server Error")
        }
        if(result[0][0] === undefined){
            res.send({
                message:"User Not Found",
                status:404
            });
        } else {
            const storedPassword = result[0][0].password
            if (storedPassword === password){
                const token = jwt.sign({user_name},"my_secrate_key");
                res.send({
                    jwt_token: token,
                    status:200
                })
            } else {
                res.send({
                    message:"password incorrect",
                    status:400
                })
            }
        }
    });
})


app.listen(8000, () => {
    console.log("backend running");
})