const express = require('express');
const dotenv = require('dotenv');
const router = require('./router');
const connectDatabase = require('./helpers/database/connect');
const errorHandler = require('./middlewares/errors/errorHandler');
const path = require('path');

const app = express();

dotenv.config({
    path: "./config/env/config.env"
})

const srr = ["uıhbbbjkj","hojnınjkm"];

connectDatabase();

app.use(express.json());

const PORT = process.env.PORT;

app.use("/api",router);

app.use(errorHandler);
//Statik
app.use(express.static(path.join(__dirname,"public")));
app.listen(PORT, () => {
    console.log(`App Started on ${PORT} in ${process.env.NODE_ENV}`);
});