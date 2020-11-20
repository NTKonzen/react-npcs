const express = require('express')
var app = require('express')();
var server = require('http').createServer(app);
const io = require('./config/io-config')(server);
const backEngine = require('./controllers/backEngine')(io);
const NPCEngine = require('./controllers/NPCEngine')(io);

const socketConnections = require('./controllers/socket')(io);

const PORT = process.env.PORT || 3001;

// Routes the user to the React html
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/client/public/index.html')
});

server.listen(PORT, () => {
    console.log('listening on http://localhost:' + PORT);
}); 