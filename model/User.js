const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name']
    },
    phone: {
        type: Number,
        required: [true, 'Please enter your Phone Number']
    },
    email: {
        type: String,
        required: [true, 'Please enter your Mail'],
        unique: [true, 'Email has been used']
    },
    age: {
        type: Number
    },
    username: {
        type: String,
        unique: [true, 'Username Exists']
    },
    profilePhoto: {
        type: String,
        default: this.name + 'profilePhoto'
    },
    createdAt: {
        type: Date,
        immutable: true,
        default : () => Date.now()
    },
    updatedAt: {
        type: Date,
        default : () => Date.now()
    },
    password: {
        type: String,
        select: false
    }
})

//Encrypt Password using bCrypt
UserSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//Sign JWT and return
UserSchema.methods.getSignedJwtToken = function(){
    return jwt.sign({ id: this._id}, process.ENV.SECRET, {expiresIn: process.env.JWT_EXPIRE})
}

UserSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('UserModel', UserSchema);

