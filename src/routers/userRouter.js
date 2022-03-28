const express = require('express');
const Auth = require('../middlewares/Auth');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/User');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/Account');

const userRouter = new express.Router();

userRouter.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateToken();

        res.status(201).send({ user, token });
    } catch (e) {
        res.status(500).send(e);
    }
});

userRouter.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateToken()

        res.send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
})

userRouter.post('/users/logout', Auth, async (req, res) => {
    const user = req.user;

    try {
        user.tokens = user.tokens.filter((token) => {
            return token.token !== req.token;
        })

        await user.save();

        res.send(user);

    } catch (e) {
        res.status(500).send(e);
    }
})

userRouter.post('/users/logoutAll', Auth, async (req, res) => {
    const user = req.user;
    try {
        user.tokens = [];
        await user.save();

        res.status(200).send(user);
    } catch (e) {
        res.status(500).send(e)
    }
})

userRouter.get('/users/me', Auth, async (req, res) => {
    res.send(req.user)
})

userRouter.patch('/users/me', Auth, async (req, res) => {
    const requstedUpdate = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'age', 'password'];
    const isUpdatable = requstedUpdate.every(update => allowedUpdates.includes(update));

    if (!isUpdatable) {
        return res.status(404).send();
    }

    try {
        const user = req.user;

        requstedUpdate.forEach((update) => {
            user[update] = req.body[update];
        })

        await user.save();

        if (!user) {
            return res.status(404).send();
        }

        res.status(200).send(user);
    } catch (e) {
        res.status(500).send(e);
    }
})

userRouter.delete('/users/me', Auth, async (req, res) => {
    try {
        await req.user.remove();
        sendCancelationEmail(req.user.email, req.user.name);

        res.send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.endsWith('.jpg')) {
            return cb(new Error('Please upload jpg file.'));
        }

        cb(undefined, true);
    }
})

userRouter.post('/users/me/avatar', Auth, upload.single('avatar'), async (req, res) => {
    try {
        const buffer = await sharp(req.file.buffer).png().resize({ width: 400, height: 400 }).toBuffer();

        req.user.avatar = buffer;
        await req.user.save();

        res.status(201).send(req.user);
    } catch (e) {
        res.status(400).send({ error: "data required" });
    }

}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });

    next();
})

userRouter.delete('/users/me/avatar', Auth, async (req, res) => {
    try {
        req.user.avatar = undefined;

        await req.user.save();

        res.send(req.user);
    } catch (e) {
        res.status(404).send(e);
    }

})

userRouter.get('/users/me/avatar', Auth, async (req, res) => {
    try {
        if (!req.user.avatar) {
            throw new Error('Profile image not founded!');
        }

        res.set('Content-Type', 'image/png');
        res.send(req.user.avatar);

    } catch (e) {
        res.status(404).send();
    }
})

module.exports = userRouter;