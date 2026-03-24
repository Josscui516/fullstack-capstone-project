// Step 1 - Task 2: Import necessary packages
const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino');

// Step 1 - Task 3: Create a Pino logger instance
const logger = pino();

// Load environment variables
dotenv.config();

// Step 1 - Task 4: Create JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    try {
        // Task 1: Connect to MongoDB
        const db = await connectToDatabase();

        // Task 2: Access collection
        const collection = db.collection("users");

        // Task 3: Check for existing email
        const existingEmail = await collection.findOne({ email: req.body.email });
        if (existingEmail) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Hash password
        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);

        const email = req.body.email;

        // Task 4: Save user details
        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });

        // Task 5: Create JWT authentication
        const payload = {
            user: {
                id: newUser.insertedId,
            },
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User registered successfully');

        res.json({ authtoken, email });

    } catch (e) {
        console.error(e);
        return res.status(500).send('Internal server error');
    }
});

router.post('/login', async (req, res) => {
    try {
        // Task 1: Connect to MongoDB
        const db = await connectToDatabase();

        // Task 2: Access users collection
        const collection = db.collection("users");

        // Task 3: Find user by email
        const theUser = await collection.findOne({ email: req.body.email });

        // Task 7: User not found
        if (!theUser) {
            logger.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        // Task 4: Compare password
        const isMatch = await bcryptjs.compare(req.body.password, theUser.password);
        if (!isMatch) {
            logger.error('Passwords do not match');
            return res.status(404).json({ error: 'Wrong password' });
        }

        // Task 5: Fetch user details
        const userName = theUser.firstName;
        const userEmail = theUser.email;

        // Task 6: Create JWT
        const payload = {
            user: {
                id: theUser._id.toString(),
            },
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User logged in successfully');

        // Send response
        res.json({ authtoken, userName, userEmail });

    } catch (e) {
        console.error(e);
        return res.status(500).send('Internal server error');
    }
});

router.put('/update', async (req, res) => {

    // Task 2: validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error('Validation errors in update request', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Task 3: check email in header
        const email = req.headers.email;
        if (!email) {
            logger.error('Email not found in the request headers');
            return res.status(400).json({ error: "Email not found in the request headers" });
        }

        // Task 4: connect DB
        const db = await connectToDatabase();
        const collection = db.collection("users");

        // Task 5: find user
        const existingUser = await collection.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }

        if (req.body.firstName) existingUser.firstName = req.body.firstName;
        if (req.body.lastName) existingUser.lastName = req.body.lastName;

        if (req.body.password) {
            const salt = await bcryptjs.genSalt(10);
            existingUser.password = await bcryptjs.hash(req.body.password, salt);
        }

        existingUser.updatedAt = new Date();

        // Task 6: update DB
        const updatedUserResult = await collection.findOneAndUpdate(
            { email },
            { $set: existingUser },
            { returnDocument: 'after' }
        );

        const updatedUser = updatedUserResult.value;

        // Task 7: create JWT
        const payload = {
            user: {
                id: updatedUser._id.toString(),
            },
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User updated successfully');

        res.json({ authtoken });

    } catch (e) {
        console.error(e);
        return res.status(500).send('Internal server error');
    }
});

module.exports = router;