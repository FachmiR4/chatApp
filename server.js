require('dotenv').config();

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE);

mongoose.connection.on('error', (err) => {
    console.log(err.message);
});
mongoose.connection.once('open', ()=>{
    console.log('mongoDB connection');
});



// Bring in the models
require("./models/user");
require("./models/Message");
require("./models/Chatroom");
require("./models/profile")


const app = require('./app');


const server = app.listen(8080, () => {
    console.log('server running on http://localhost:8080/');
});



module.exports = server;
