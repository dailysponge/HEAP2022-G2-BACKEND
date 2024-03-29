const express = require('express');
const moment = require('moment');
const {User,Login} = require('../../utils/index');
const bcrypt = require('bcrypt');

const router = express.Router();

// finding user, logging user in
router.post('/signin', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const conditions = {};
        if (email) conditions.email = email;
        if (password) conditions.password = password;
        const [findUserError, user] = await User.findUser(conditions);

        if (findUserError) {
            throw new Error(findUserError, conditions);
        }

        // creating and starting the tracking of user log in
        const [createSessionError, userSession] = await Login.loginSessionStart(
            email
        );
        if (createSessionError) {
            throw createSessionError;
        }

        const response = {
            status: 200,
            timestamp: moment().format(),
            data: {
                user,
                userSession
            }
        };
        res.json(response);
    } catch (error) {
        console.error('Error retrieving account', error);
        res.status(500).json('Error retrieving account ' + error);
    }
});
// signing up the user (creating account)
router.post('/signup', async (req, res) => {
    try {
        if (!req.body.email || !req.body.fullname || !req.body.password) {
            throw new Error('Missing parameters');
        }
        const email = req.body.email;
        const password = req.body.password;
        const fullname = req.body.fullname.trim();
        var today = new Date();
        var date =
            today.getFullYear() +
            '-' +
            (today.getMonth() + 1) +
            '-' +
            today.getDate();
        var time =
            today.getHours() +
            ':' +
            today.getMinutes() +
            ':' +
            today.getSeconds();
        var dateTime = date + ' ' + time;

        const [createAccountError, user] = await User.createUser(
            email,
            fullname,
            password,
            dateTime
        );
        if (createAccountError) {
            throw createAccountError;
        }

        // creating and starting the tracking of user log in
        const [createSessionError, userSession] = await Login.loginSessionStart(
            email
        );
        if (createSessionError) {
            throw createSessionError;
        }

        const response = {
            status: 200,
            timestamp: moment().format(),
            data: {
                user,
                userSession
            }
        };
        res.json(response);
    } catch (error) {
        console.error('Error creating account', error);
        res.status(500).json(`Error creating account: ${error}`);
    }
});
// update user info
router.patch('/edit', async (req, res) => {
    try {
        const email = req.body.email;
        const fullname = req.body.fullname;
        const password = req.body.password;
        const newPassword = req.body.newPassword;

        // updating user session
        const [createSessionError, userSession] = await Login.loginSessionRenewal(
            email
        );
        if (createSessionError) {
            throw createSessionError;
        }

        if (email && fullname && password && newPassword) {
            const update = {};
            const conditions = {
                email: email,
                fullname: fullname
            };
            const salt = await bcrypt.genSalt(10);
            update.password = await bcrypt.hash(newPassword, salt);

            const [error, user] = await User.findAndUpdateUser(
                conditions,
                password,
                update
            ); // the password is the original plain text password. To be compared with database password for authentication before changing password
            if (error) {
                throw new Error(error, conditions);
            }
            const response = {
                status: 200,
                timestamp: moment().format(),
                data: {
                    user,
                    userSession
                }
            };
            res.json(response);
        }
    } catch (error) {
        console.error('Error getting account', error);
        res.status(500).json('Error getting account ' + error);
    }
});
// deleting user account
router.delete('/:email', async (req, res) => {
    try {
        if (!req.params.email) {
            throw new Error('Missing parameters');
        }

        const [error, user] = await User.findAndDeleteUser({
            email: req.params.email
        });
        if (error) {
            throw new Error(error, req.params.email);
        }

        // deleting user session
        const [sessionError, userSession] = await Login.deletingSession({
            email: req.params.email
        });
        if (sessionError) {
            throw new Error(sessionError, req.params.email);
        }

        const response = {
            status: 200,
            timestamp: moment().format(),
            data: {
                user
            }
        };
        res.json(response);
    } catch (error) {
        console.error('Error deleting account', error);
        res.status(500).json('Error deleting account ' + error);
    }
});

// extending user session
router.patch('/:email', async (req, res) => {
    try {
        if (!req.params.email) {
            throw new Error('Missing parameters');
        }

        // checking if session is valid
        const [checkingError, checkingUserSession] =
            await Login.loginSessionValidation(req.params.email);
        if (checkingError) {
            throw new Error(checkingError, req.params.email);
        }

        // updating the session
        const [updateError, updatingUserSession] = await Login.loginSessionRenewal(
            req.params.email
        );
        if (updateError) {
            throw new Error(updateError, req.params.email);
        }

        const response = {
            status: 200,
            timestamp: moment().format(),
            data: {
                updatingUserSession
            }
        };
        res.json(response);
    } catch (error) {
        console.error('Error checking and/or renewing user session', error);
        res.status(500).json(
            'Error checking and/or renewing user session ' + error
        );
    }
});
module.exports = router;
