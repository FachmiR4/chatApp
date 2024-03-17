const express = require('express');
const cors = require('cors');


const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cors());

app.use('/api',require('./routes/user'));
app.use('/api', require('./routes/profile'));
app.use('/api', require('./routes/chatroom'));


const errorHandlers = require('./handlers/errorHandlers');
app.use(errorHandlers.notFound);
app.use(errorHandlers.mongoseErrors);
if(process.env.ENV === "DEVELOPMENT"){
    app.use(errorHandlers.developmentErrors);
}else{
    app.use(errorHandlers.productionErrors);
}


module.exports = app;



  


