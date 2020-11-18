const express = require('express')
var app = require('express')();
var server = require('http').createServer(app);
const io = require('./config/io-config')(server);
// const io = require("socket.io")(server, {
//     cors: {
//         origin: ["http://localhost:3000", "http://192.168.1.23:3000"],
//         methods: ["GET", "POST"],
//         allowedHeaders: ["my-custom-header"],
//         credentials: true
//     }
// });
const backEngine = require('./controllers/backEngine')(io);

const socketConnections = require('./controllers/socket')(io);

// Routes the user to the React html
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/client/public/index.html')
});

server.listen(3001, () => {
    console.log('listening on http://localhost:3001');
});