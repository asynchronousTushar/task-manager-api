const mongoose = require('mongoose');

mongoose.connect( process.env.MONGOOSE_URL, {
    useUnifiedTopology: true,
});

// MONGOOSE_URL=mongodb://127.0.0.1:27017/task-manager-app


