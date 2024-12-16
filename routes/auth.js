const express = require('express');
const User = require('../models/user')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config();
const getuser = require('../middleware/getuser');

const JWT_secret = process.env.JWT_SECRET_KEY;

// Route 1 - create a user using POST :"/notebook/auth/createuser".doesnot require login
router.post('/createuser', [
    // below is the validation of the entries for the user
    body('name').isLength({ min: 5 }),
    body('username', 'must be unique').isLength({ min: 6 }),
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
], async (req, res) => {
    let success = false;
    // console.log(req.body)
    //If there are errors return bad request and the errors 
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ result: result.array() });
    }
    
    try {
        // check wherther user with same username exist already or not
        let user = await (User.findOne({ username: req.body.username }) && User.findOne({ email: req.body.email }));
        if (user) {
            return res.status(400).json({success, error: "Sorry a user with same email and username is already exists" })
        }
        const salt = await bcrypt.genSalt(10); // salt for added to the password
        const securedPassword = await bcrypt.hash(req.body.password,salt); //convert password into hash with added salt
        // create a new user
        user = await User.create({
            name: req.body.name,
            username: req.body.username,
            password: securedPassword,
            email: req.body.email,
        })
        // const JWT_secret = process.env.JWT_SECRET_KEY;
        const data = {
            user:{
                id:user.id
            }
        }
        const authtoken = jwt.sign(data,JWT_secret) // generating json web token using jwt.sign()
        // console.log(authtoken);
        success = true;
        res.json({success,authtoken})
        // res.json({ "Great": "User created" })
    }
    catch (error) {
        // if any other error occured then show it
        console.error(error.message); // idealy use logger and sqs
        res.status(500).send("Internal server error occur")
    }
})
// Route 2 - authenticate user using POST :"/notebook/auth/loginuser".doesnot requuire login
router.post('/loginuser',[
    body('username'),
    // body('email',"Enter a valid email").isEmail(),
    body('password',"Password can't be blanked").exists()
],async(req,res)=>{
    let success = false;
    //If there are errors return bad request and the errors 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {username,password} = req.body;

    try {
        let user = await User.findOne({username});
        if(!user){
            return res.status(400).json({error:"Please try to login with correct credentials"});
        }
        
        const passwordCompare = await bcrypt.compare(password,user.password);
        if(!passwordCompare){
            success =  false;
            return res.status(400).json({success,error:"Please try to login with correct credentials"});
        }
        // const JWT_secret = process.env.JWT_SECRET_KEY;
        const payload={
            user:{
                id:user.id
            }
        }
        const authtoken = jwt.sign(payload,JWT_secret) // generating json web token using jwt.sign()
        success = true;
        res.json({success,authtoken})
    }
    catch (error) {
        // if any other error occured then show it
        console.error(error.message); // idealy use logger and sqs
        res.status(500).send("Internal server error occur")
    }
})

// Route 3 - get logged in user details using POST :"/notebook/auth/user".require login 

router.post('/user',getuser,async(req,res)=>{
try {
    const userID = req.user.id;
    const user = await User.findById(userID).select("-password")
    res.send(user);
}
catch (error) {
    // if any other error occured then show it
    console.error(error.message); // idealy use logger and sqs
    res.status(500).send("Internal server error occur")
}
})

module.exports = router;