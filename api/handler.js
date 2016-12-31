import express from "express";

var app     = express();
var router  = require('./register.js')(app);
app.listen(8080, () => {});