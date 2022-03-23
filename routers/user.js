const {
    createProfile,
    deleteProfile,
    editProfile,
    login,
    uploadProfilePicture } = require('../controllers/user');

const express = require('express');
const router = express.Router();

router.post('/signup',createProfile);
router.get('/login',login);
router.put('/editProfile',editProfile)
router.delete('/deleteprofile',deleteProfile);
router.put('/uploadProfilePicture',uploadProfilePicture);

module.exports = router;