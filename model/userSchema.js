const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require("validator")

const useSchema = new mongoose.Schema({
    name: {
        type: String,
        required:true,
        trim:true
    },
    email: {
        type: String,
        required:true,
        unique:true,
        validate( value ){
            if(!validator.isEmail(value)){
                throw new Error("not valid email")
            }
        }
    },
    phone: {
        type: Number,
        required:true,
        minlength:10
    },
    password: {
        type: String,
        required:true,
        minlength:6
    },
    tokens: [
        {
            token: {
                type: String,
                required:true
            }
        }
    ]
})

useSchema.pre('save', async function (next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});


useSchema.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign({_id:this._id}, process.env.SECRET_KEY, {
            expiresIn:"1d"
        });
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (err) {
        res.status(422).json(err);
    }
}


const User = mongoose.model('USER', useSchema);

module.exports = User;