const express = require('express');
const mongoose = require('mongoose');
const { validateUser, userModel } = require('../model/user.js');
const e = require('express');



const router = express.Router();



// Get all users...
router.get('/', async (req, res) => {
    const users = await userModel.find().sort('username');
    return res.json({
        success: true,
        data: users,
        message: 'Successfully fetched all users!',
        })
});

// Get a single user
router.get('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
            success: false,
            data: [],
            message: 'Invalid user id',
        })
    }
    // search for the user in the database
    const user = await userModel.findById(req.params.id);
    // check if user not found then return 404
    if (!user) {
        return res.status(404).json({
            success: false,
            data: [],
            message: 'User not found',
        })
    }
    // return the user object if found
    return res.json({
        success: true,
        data: user,
        message: 'Successfully fetched the user!',
        })
});

// update an existing user
router.put('/:id', async (req, res) => {
    // validate the request body first
    const {error} = validateUser(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            data: [],
            message: error?.details[0]?.message,
        })
    }
    // find the user by id and update it with the request body
    const user = await userModel.findByIdAndUpdate(req.params.id, {
        username: req.body.username,
        email: req?.body?.email,
        password: req.body.password,
        profilePicture: req.body.profilePicture,
        bio: req.body.bio,
        followers: req.body.followers,
        following: req.body.following,
        posts: req.body.posts,
        isAdmin: req.body.isAdmin
    }, {new: true});
    // check if user not found then return 404
    if (!user) {
        return res.status(404).json({
            success: false,
            data: [],
            message: 'User not found',
        })
    }
    // return the updated user object
    return res.json({
        success: true,
        data: user,
        message: 'Successfully updated the user!',
        })
});

// delete an existing user
router.delete('/:id', async (req, res) => {
    const userId = req.params.id;
    // find the user by id and delete it
    const deletedUser = await userModel.findOneAndDelete({ _id: userId });
    // check if user not found then return 404
    if (!deletedUser) {
        return res.status(404).json({
            success: false,
            data: [],
            message: 'User not found',
        })
    }
    // return the deleted user object
    return res.json({
        success: true,
        data: deletedUser,
        message: 'Successfully deleted the user!',
        })
});

// folow a user
router.put('/:id/follow', async (req, res) => {
    // check if its the same user
    if (req.body.userId !== req.params.id) {
        try {
            const user = await userModel.findById(req.params.id);
            const currentUser = await userModel.findById(req.body.userId);
            if (!user.followers.includes(req.body.userId)){
                await user.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({ $push: { following: req.params.id } });
                return res.status(200).json({
                    success: true,
                    data: [],
                    message: 'User has been followed',
                })
                
            }else{
                return res.status(403).json({
                    success: false,
                    data: [],
                    message: 'You already follow this user',
                })
            }

        }catch(err){
            return res.status(500).json({
                success: false,
                data: [],
                message: err,
            })
        }
    }else{
        return res.status(403).json({
            success: false,
            data: [],
            message: 'You cant follow yourself',
        })
    }
});

// unfollow a user 
router.put('/:id/unfollow', async (req, res) => {
    // check if its the same user
    if (req.body.userId !== req.params.id) {
        try {
            const user = await userModel.findById(req.params.id);
            const currentUser = await userModel.findById(req.body.userId);
            if (user.followers.includes(req.body.userId)){
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({ $pull: { following: req.params.id } });
                return res.status(200).json({
                    success: true,
                    data: [],
                    message: 'User has been unfollowed',
                })
                
            }else{
                return res.status(403).json({
                    success: false,
                    data: [],
                    message: 'You dont follow this user',
                })
            }

        }catch(err){
            return res.status(500).json({
                success: false,
                data: [],
                message: err,
            })
        }
    }else{
        return res.status(403).json({
            success: false,
            data: [],
            message: 'You cant unfollow yourself',
        })
    }
});


module.exports = router;