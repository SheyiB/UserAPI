const express = require('express');
const user = require('./routers/user');
const mongoose = require('mongoose');
const morgan = require('morgan');
const app = express();
const dotenv = require('dotenv');

mongoose.connect('mongodb::localhost//userapi', ()=>{
    console.log('Database Connected'), e => {console.log(`Could not connect because of ${e.message}`)}
});


//Load Environment Variable
dotenv.config({path: './config.env'});
// Body Parser
app.use(express.json());

// Dev logging Middleware - MORGAN
app.use(morgan('dev'));

//Mount Routers
app.use('/userApi', user);

const PORT = process.env.PORT || 2300;


app.listen(PORT, ()=>{
    console.log(`App is running on PORT: ${PORT} `)
})
