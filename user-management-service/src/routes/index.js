const express = require('express');
const { login, getUser, getAllUsers, deleteUser, editUser , adminApprove, oauthLogin} = require('../controllers/userController');

const router = express.Router();

router.post('/login', login);
router.post('/oauth/login', oauthLogin);
router.get('/users/:id', getUser);
router.get('/users', getAllUsers); // Route to get all users
router.delete('/users/:id', deleteUser); // Route to delete a user
router.put('/users/:id', editUser); // Route to edit a user
router.post('/admin/approve', adminApprove);

module.exports = router;