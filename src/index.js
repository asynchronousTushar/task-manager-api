require('./data/mongoose');
const express = require('express');
const taskRouter = require('./routers/taskRouter');
const userRouter = require('./routers/userRouter');

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log('App started at port', port);
})