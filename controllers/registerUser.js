const validator = require('validator');
// const con = require('../server/db/connection');

// const asyncQuery = require('../server/db/asyncQuery');

const bcrypt = require('bcrypt');
const saltRounds = 15;

// const registerUser = require('../../controllers/registerUser');

const { register } = require('../models/user');

const registerUser = (username, email, password) => new Promise(async (resolve, reject) => {

       try {
            // verify details
        // these should already have been validated clientside
        // therefore, if they are incorrect, they wil recieve a generic response

        // email
        if (!validator.isEmail(email)) reject('Invalid email address');

        // password
        if (!password.match(/^.{10,128}$/)) reject('Password invalid length');
        if (!!password.match(/(.)\1{2,}/)) reject('Password more than 2 identical characters');

        // password matches min 3 of following rules
        let rulesMet = 0;

        if (password.match(/[A-Z]/)) rulesMet++;                   // 'At least 1 uppercase character (A-Z)'
        if (password.match(/[a-z]/)) rulesMet++;                   // 'At least 1 lowercase character (a-z)'
        if (password.match(/[0-9]/)) rulesMet++;                   // 'At least 1 digit (0-9)'
        if (password.match(/[!@#$%^&*(),.?":{}|<> ]/)) rulesMet++; // 'At least 1 special character (punctuation and space count as special characters)'

        if (rulesMet < 3) reject('Password Min 3/4 rules met');

        // username
        if (!username.match(/^.{2,14}$/)) reject('Username invalid length');
        if (!username.match(/^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]*$/)) reject('Username invalid characters');


        const passwordHash = await bcrypt.hash(password, saltRounds);

        const newUser = await register(username, email, passwordHash)

        if (!newUser) {
            console.log('NEW USER ERREE', newUser)
            reject('Error creating user');
        }

        resolve(newUser)
       } catch(e) {
           console.log('register error');
           resolve(null)
       }


});

module.exports = registerUser;