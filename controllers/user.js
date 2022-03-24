const UserModel = require('../model/User');
const jwt = require('jsonwebtoken');
var admin = require("firebase-admin");
const uuid = require('uuid-v4');

module.exports.createProfile = async(req,res) =>{

    try{

        const user = await UserModel.create(req.body);

        res.status(201).json({ status: 'Success', data: user});

    }catch(err){
        res.status(501).json({
            status: 'Failed',
            data: `Server Error: ${err.message}`
        })
    }

}

module.exports.login = async(req,res) =>{
    try{
        //Get user password and username
        const {username, password} = req.body;

        //If either data is not provided tell user to provide it
        if(!username || !password){
            res.status(401).json({status: 'error', data: 'Please Provide Email and Password'})
        }

        //Search for DB for the entered username with password
        const user = await UserModel.findOne({username}).select('+password');

        //If the user doesn't exist return error
        if(!user){
            res.status(401).json({status: 'error', data: 'Invalid Credential'})
        }

        //If user data exists check if passwords match
        const isMatch = await user.matchPassword(password);


        const options = {
            expires: new Date(Date.now() + 30 * 24* 60 * 60 *1000),
            httpOnly: true,
            secure: true
        }

        //If password doesn't match return error
        if(!isMatch){
            res.status(401).json({status: 'error', data: 'Invalid Credentials'})
        }

        //If password match create token
        const token = user.getSignedJwtToken();

        //return token and put token in cookies
        res
            .status(200)
            .cookie('token', token)
            .json({
                success: true,
                token
            })

    }catch(err){
        res.status(501).json({
            status: 'Failed',
            data: `Server Error: ${err.message}`
        })
    }

}


module.exports.editProfile = async(req,res) =>{
    try{
        const  userid = await tokenizer(req,res);



        const user = await UserModel.findByIdAndUpdate(userid, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: "success",
            data: user
        })

    }catch(err){
        res.status(501).json({
            status: 'Failed',
            data: `Server Error: ${err.message}`
        })
    }

}

module.exports.uploadProfilePicture = async(req,res) =>{
    try{
        tokenizer(req,res);
        let profilephoto;

        if(!req.files){
            res.status(400).json({ status: 'Failed', data: `Upload a photo`})
        }

        const file = req.files.file;

        file.name = `photo_${req.user._id}${path.parse(file.name).ext}`;

        var serviceAccount = require(process.ENV.FIREBASEJson);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: process.ENV.FirebaseLink
        });

        var bucket = admin.storage().bucket();

        var filename = req.files.file

        async function uploadFile() {

                const metadata = {
                metadata: {
                firebaseStorageDownloadTokens: uuid()
                },
            contentType: 'image/png',
            cacheControl: 'public, max-age=31536000',
            };


        await bucket.upload(filename, {
            gzip: true,
            metadata: metadata,
        });

console.log(`${filename} uploaded.`);

}

uploadFile().catch(console.error);
        profilephoto = file.name;

        const user = await UserModel.findByIdAndUpdate(req.user.id, {profilePhoto}, {
            new: true,
            runValidators: true
        });

        res.status(201).json({ status: 'Success', data: user, downloadlink : metadata.metadat.firebaseStorageDownloadTokens})
    }catch(err){
        res.status(501).json({
            status: 'Failed',
            data: `Server Error: ${err.message}`
        })
    }

}

module.exports.deleteProfile = async(req,res) =>{
    const  userid = await tokenizer(req,res);
    try{
        const user = await UserModel.findByIdAndDelete(userid);
        res.status(201).json({ status: 'Success', data: []})
    }catch(err){
        res.status(501).json({
            status: 'Failed',
            data: `Server Error: ${err.message}`
        })
    }

}


async function tokenizer(req,res ) {
    let token;
    let id;
    console.log(req.headers.cookie.split('=')[1])

    try {

        token = req.headers.cookie.split('=')[1];


    } catch (error) {
            console.log(error.message)
    }


     // Make sure token exists
     if(!token) {
        res.status(401).json({status: 'Error', data:'Not authorized to access this route'});
     }
     try {
         // Verify token
        const decoded = jwt.verify(token,process.ENV.SECRET);

         console.log(decoded);

         req.myToken = decoded.id;

        req.user = await UserModel.findById(decoded.id);

        id = req.user.id;


    } catch (err) {
        res.status(401).json({status: 'Error', data: `${err.message}`});
     }

     return id
    }
