const jwt = require("jsonwebtoken")

const getuser=(req,res,next)=>{
    // Get the user form jwt token and add id to req object 
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error:"Please authenticate yourself with valid token"})
    }
    try {
        const string = jwt.verify(token,process.env.JWT_SECRET_KEY);
        req.user = string.user;
        next();
    } catch (error) {
        res.status(401).send({error:"Please authenticate yourself with valid token"})
    }
}

module.exports = getuser;