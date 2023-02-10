const jwt = require("jsonwebtoken")
const User = require("../model/userSchema")


const Authenticate = async (req, res, next) => {
    try { 
        const token = req.headers.authorization;
        const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
        const rootUser = await User.findOne({ _id: verifyToken._id, "tokens.token": token});

        if (!rootUser) { throw new Error('User not Found') }

        req.token = token;
        req.rootUser = rootUser;
        req.userID = rootUser._id;

        next();
        
    } catch (error) {
        res.status(401).json({status:401,message:'Unauthorized No token provided'});
    }
}

module.exports = Authenticate