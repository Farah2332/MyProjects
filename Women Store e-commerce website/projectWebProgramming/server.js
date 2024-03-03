'use strict';
var express = require('express');
var app = express();
var port = process.env.PORT || 1337;
var path = require('path');
var HTMLpath = path.join(__dirname, "D: \connectToDb\projectWebProgramming");
app.use(express.static(HTMLpath));
app.use(express.urlencoded({ extended: true }));
var mysql = require('mysql');
var connect = require('./connectjs');



app.get("/login", (req, res) => {

    res.sendFile(`${HTMLpath}/loginsigup.html`);

});
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Perform a database query to check if the email and password match
    const query = 'SELECT * FROM customers WHERE customer_email = ? AND customer_pass = ?';
    con.query(query, [email, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length > 0) {
            // User found, login successful
            return res.status(200).send('Logged in successfully');
        } else {
            // No matching user found
            return res.status(401).send('Invalid email or password');
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});