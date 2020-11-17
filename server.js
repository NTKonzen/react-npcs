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

// IGNORE THIS HUGE BLOCK OF NOTES LOL

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

// Routes the user to the React html
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/client/public/index.html')
});

// Here I'm creating a client object that stores all the active clients on the server because I'm too lazy to set up a mongo database for this
const clients = new Object();

// This is called every time someone connects to the server
io.on('connection', (socket) => {

    // Grabs the username of the client from the query made in Chat.js (look at the socket options stated at the top of Chat.js)
    let username = socket.request._query.username;
    if (username !== undefined) {

        // Each client object is set to a key of it's own lowercase username(this makes it easy to call later)
        clients[username.toLowerCase()] = {
            // The socket id changes every time someone connects to the server so i put this in place to keep the client object updated
            socketID: socket.id,
            username: username,
            // Used in socket.on('whisper')
            online: true,
            // User in socket.on('chat message')
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

            // this block of code essentially generated a string value of code that is then converted into javascript with the eval() function below
            const toRoomString = () => {
                const toRoomArray = ['io'];
                fromClient.chatRooms.forEach(room => {
                    // If you daisy chain .to() in a single .emit() it prevents the client from receiving the .emit() multiple times if they are in multiple rooms
                    // for example: 
                    //      socket.to('room1').to('room2').emit('chat message') 
                    // is better than 
                    //      socket.to('room1').emit('chat message')
                    //      socket.to('room2').emit('chat message')
                    toRoomArray.push(`.to('${room}')`)
                })
                toRoomArray.push(`.emit('chat message', {username, message});`);
                return toRoomArray.join('')
            }

            eval(toRoomString());
        });

        socket.on('whisper', ({ userTo, message, username }) => {
            let clientTo = clients[userTo.toLowerCase()];

            console.log(`${username} => ${userTo}: ${message}`)

            if (clientTo === undefined) {
                // if client doesn't exist
                io.to(username).emit('error', { err: `You can't whisper to somebody that doesn't exist!` })
            } else if (!clientTo.online) {
                // if client is offline
                io.to(username).emit('error', { err: `Looks like ${clientTo.username} is offline` })
            } else if (clientTo !== undefined) {
                // sends the message to the client that it was directed to and back to the client it was sent from
                io.to(clientTo.username).to(username).emit('whisper', { message: message, username: username });
            }

        });

        // for joining rooms
        socket.on('join', ({ room, username }) => {
            const clientJoining = clients[username.toLowerCase()];
            clientJoining.chatRooms.push(room);
            console.log(`${username} joined ${room}`);

            // Whenever someone logs into the server, they join a room named after their own username
            // That's how whispering is handled
            // So this checks if the room they're joining is actually just someone's username and prevent it from emitting if it is
            if (!Object.keys(clients).includes(room.toLowerCase())) {
                socket.join(room);
                io.to(room).emit('join', { room: room, userJoining: username });
            }
        });

        // i haven't done this yet lol
        // socket.on('leave')

        // Haven't set this up on the client side yet but this will work when i do
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