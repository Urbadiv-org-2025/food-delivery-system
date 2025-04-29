const express = require('express');
const { login, getUser, getAllUsers, deleteUser, editUser } = require('../controllers/userController');

const router = express.Router();

router.post('/login', login);
router.get('/users/:id', getUser);
router.get('/users', getAllUsers); // Route to get all users
router.delete('/users/:id', deleteUser); // Route to delete a user
router.put('/users/:id', editUser); // Route to edit a user

module.exports = router;