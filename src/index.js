const express = require('express');
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authotization-header");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
    next();
});

// Routes
app.use(require('./routes/users'));

app.listen(3000, (req, res) => {
    console.log('Server on port', 3000);
});