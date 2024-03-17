const jwt = require("jwt-then");

module.exports = async (req, res, next) => {
    try{

        if(!req.headers.authorization){
            res.sendStatus(403);
        }
        const token = req.headers.authorization.split(" ")[1];

        const payload = await jwt.verify(token, process.env.SECRET);
        req.payload = payload;

        next();
    
    }catch(error){
        console.log(error);
        res.sendStatus(403);
    }
}