const express = require('express');
const path = require('path');
var app = express();
var server = require('http').createServer(app);
const io = require('./config/io-config')(server);
// const backEngine = require('./controllers/backEngine')(io);
// const NPCEngine = require('./controllers/NPCEngine')(io);

const socketConnections = require('./controllers/socket')(io);

const PORT = process.env.PORT || 3001;

if (process.env.PUBLIC_URL === '' || !process.env.PUBLIC_URL) {
    if (process.env.NODE_ENV === 'development') {
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '/client/public/index.html'))
        })

        server.listen(PORT, () => {
            console.log('Server listening on http://localhost:' + PORT);
        });
    } else if (process.env.NODE_ENV === 'production') {
        app.use(express.static(path.join(__dirname + '/client/build/')))

        // Routes the user to the React html
        app.get('*', (req, res) => {
            res.sendFile(__dirname + '/client/build/index.html')
        });

        server.listen(PORT, () => {
            console.log('Server listening on nicksnpcs.herokuapp.com:' + PORT);
        });
    }
} else {
    app.use(express.static(path.join(__dirname + '/client/build/')))

    // Routes the user to the React html
    app.get('*', (req, res) => {
        res.sendFile(__dirname + '/client/build/index.html')
    });

    server.listen(PORT, () => {
        console.log('Server listening on ' + process.env.PUBLIC_URL);
    });

}

