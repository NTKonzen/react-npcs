const express = require('express')
var app = require('express')();
var server = require('http').createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: ["http://localhost:3000", "http://192.168.1.23:3000"],
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

// app.use(express.static('public'))

// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/public/signup.html');
// });

// app.get('/chat', (req, res) => {
//     res.sendFile(__dirname + '/public/chat.html');
// });

// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", 'http://localhost:3000');
//     //<-- you can change this with a specific url like http://localhost:4200
//     res.header("Access-Control-Allow-Credentials", true);
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//     res.header("Access-Control-Allow-Headers",
//         'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json,Authorization');
//     next();
// });

// app.use(function (req, res, next) {
//     res.writeHead(200, {
//         "Access-Control-Allow-Origin": '*'
//     });
// });

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/client/public/index.html')
});


const clients = new Object();

io.on('connection', (socket) => {
    let username = socket.request._query.username;
    if (username !== undefined) {
        clients[username.toLowerCase()] = {
            socketID: socket.id,
            username: username,
            online: true,
            chatRooms: [username]
        };
        console.log(`${username} connected`);
        socket.join(username);

        socket.on('disconnect', () => {
            console.log(`${username} disconnected`);
            if (clients[username] !== undefined) {
                clients[username].online = false;
            }
        });

        socket.on('chat message', ({ username, message }) => {
            const fromClient = clients[username.toLowerCase()];

            const toRoomString = () => {
                const toRoomArray = ['io'];
                fromClient.chatRooms.forEach(room => {
                    toRoomArray.push(`.to('${room}')`)
                })
                toRoomArray.push(`.emit('chat message', {username, message});`);
                console.log(toRoomArray.join(''))
                return toRoomArray.join('')
            }

            eval(toRoomString());
        });

        socket.on('whisper', ({ userTo, message, username }) => {
            let clientTo = clients[userTo.toLowerCase()];

            if (clientTo === undefined) {
                io.to(username).emit('error', { err: `You can't whisper to somebody that doesn't exist!` })
            } else if (!clientTo.online) {
                io.to(username).emit('error', { err: `Looks like ${clientTo.username} is offline` })
            } else if (clientTo !== undefined) {
                // socket.join(clientTo.username);
                io.to(clientTo.username).to(username).emit('whisper', { message: message, username: username });
                // socket.leave(clientTo.username);
            }

        });

        socket.on('join', ({ room, username }) => {
            console.log(`username:${username}`)
            const clientJoining = clients[username.toLowerCase()];
            clientJoining.chatRooms.push(room);
            console.log(`${username} joined ${room}`);
            if (!Object.keys(clients).includes(room.toLowerCase())) {
                socket.join(room);
                io.to(room).emit('join', { room: room, userJoining: username });
            }
        });

        // socket.on('leave')

        socket.on('signup', ({ username }) => {
            console.log(username);
            const newUser = new Object();
            newUser.socketID = socket.id;
            newUser.username = username;
            clients.push(newUser);
            console.log(clients);

            io.emit('user created');
        });
    }

});

server.listen(3001, () => {
    console.log('listening on http://localhost:3001');
});