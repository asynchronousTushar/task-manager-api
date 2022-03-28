const express = require('express');
const Task = require('../models/Task');
const Auth = require('../middlewares/Auth');

const taskRouter = new express.Router();

taskRouter.post('/tasks', Auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {
        await task.save()
        res.status(201).send(task);

    } catch (e) {
        res.status(500).send(e);
    }
})

// taskRouter.get('/tasks', Auth, async (req, res) => {
//     const searchTerm = req.query.completed;
//     let isCompleted;

//     if (searchTerm) {
//         isCompleted = searchTerm === 'true';
//     } else {
//         isCompleted = false
//     }

//     try {
//         if (searchTerm) {
//             const getTasks = await Task.find({ owner: req.user._id, completed: isCompleted })
//             return res.status(201).send(getTasks);
//         }

//         const getTasks = await Task.find({ owner: req.user._id })
//         res.status(201).send(getTasks);

//     } catch (e) {
//         res.status(500).send(e);
//     }
// })

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
taskRouter.get('/tasks', Auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

taskRouter.get('/tasks/:id', Auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const getTask = await Task.findOne({ _id, owner: req.user._id });
        if (!getTask) {
            return res.status(404).send();
        }

        res.status(201).send(getTask);

    } catch (e) {
        if (e.name === "CastError") {
            return res.status(404).send(e);
        }
        res.status(500).send(e);
    }
})

taskRouter.patch('/tasks/:id', Auth, async (req, res) => {
    const _id = req.params.id;

    const requstedUpdate = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isUpdatable = requstedUpdate.every(update => allowedUpdates.includes(update));

    if (!isUpdatable) {
        return res.status(404).send
    }

    try {
        let task = await Task.findOne({ _id, owner: req.user._id })

        if (!task) {
            return res.status(404).send("You don't have permission to update task!")
        }

        requstedUpdate.forEach((update) => {
            task[update] = req.body[update]
        })

        await task.save()

        res.status(200).send(task);
    } catch (e) {
        res.status(500).send(e);
    }
})

taskRouter.delete('/tasks/:id', Auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            return res.status(404).send("You don't have permission!");
        }

        res.send(task);

    } catch (e) {
        res.status(500).send(e);
    }
})

module.exports = taskRouter;