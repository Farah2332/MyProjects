var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "oracle",
    database: "paraella"
})
con.connect(function (err) {
    if (err) {
        console.log("Error connecting to the database:", err);
    } else {
        console.log("Connected to the database");
    }
})

module.exports = { con };