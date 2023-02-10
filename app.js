const dotenv = require("dotenv");
const express = require('express');
const app = express();
const cors = require("cors")
const cookieParser = require('cookie-parser')
const path = require("path")

dotenv.config({ path: './config.env'});
require('./db/conn');
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(require('./routes/router'));

app.use(express.static(path.join(__dirname, "./client/build")));

app.get('*', function(req, res){
    res.sendFile(path.join(__dirname, "./client/build/index.html"));
})

app.listen(PORT, () => {
    console.log(`sever is runnig at port no ${PORT}`)
})