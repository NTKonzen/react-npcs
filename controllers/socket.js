// const clientIO = require('socket.io-client')
const handleNPCs = require('../controllers/NPCEngine');
const thisStartsWithOneOfThese = require('../serverUtilities/finding');
const NPCChecks = require('../serverUtilities/NPCChecks');

// Here I'm creating a client object that stores all the active clients on the server because I'm too lazy to set up a mongo database for this
const clients = new Object();

module.exports = function (io) {
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
                chatRooms: []
            };
            console.log(`${username} connected`);
            socket.join(username);

            socket.on('disconnect', () => {
                console.log(`${username} disconnected`);
                if (clients[username.toLowerCase()] !== undefined) {
                    clients[username.toLowerCase()].online = false;
                    // console.log(clients[username.toLowerCase()])
                }
            });

            socket.on('chat message', ({ username, message }) => {
                const fromClient = clients[username.toLowerCase()];

                if (fromClient.chatRooms.length == 0) {
                    io.to(fromClient.username).emit('error', { err: `You haven't joined any rooms!` })
                } else {
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
                }


            });

            socket.on('whisper', ({ userTo, message, username, rooms }) => {
                let clientTo = clients[userTo.toLowerCase()];
                let fromClient = clients[username.toLowerCase()];
                let goodbyeArray = ['goodbye', 'bye', 'adios', 'leave'];

                NPCChecks(`${userTo} ${message}`, rooms)
                    .then(({ NPCObj, message }) => {
                        // This next block is in charge of muting all of the active rooms that the client is a part of while they are in a conversation with an NPC
                        fromClient.chatRooms.forEach(room => {
                            // this allows the client to still receive whispers
                            if (room !== fromClient.username) {
                                // this next block checks if the user has indicated they are leaving the conversation
                                if (!thisStartsWithOneOfThese(message.toLowerCase(), goodbyeArray)) {
                                    // the client will leave every chat room they are a part of
                                    socket.leave(room)
                                } else {
                                    // the client will re-join every chat room they are a part of
                                    socket.join(room)
                                }
                            }
                        })
                        // this is sent to the NPCEngine
                        handleNPCs(io, {
                            messageFromUser: message,
                            NPCObj,
                            fromClient,
                            rooms
                        })
                    })
                    .catch((err) => {
                        console.log(err.message)

                        if (clientTo === undefined) {
                            // if client doesn't exist
                            io.to(username).emit('error', { err: `There's nobody by that name in this room` })
                        } else if (!clientTo.online) {
                            // if client is offline
                            io.to(username).emit('error', { err: `Looks like ${clientTo.username} is offline` })
                        } else if (clientTo !== undefined) {
                            console.log(`${username} => ${userTo}: ${message}`)
                            // sends the message to the client that it was directed to and back to the client it was sent from
                            io.to(clientTo.username).to(username).emit('whisper', { message: message, username: username });
                        }
                    })


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
            socket.on('leave', ({ room, username }) => {
                const clientLeaving = clients[username.toLowerCase()];
                console.log(`${username} left ${room}`);

                // essentially the same as the join function above
                if (!Object.keys(clients).includes(room.toLowerCase())) {
                    // make sure the message is emitted to the room before the user leaves or else they won't receive it
                    io.to(room).emit('leave', { room: room, userLeaving: username });
                    const chatRoomIndex = clientLeaving.chatRooms.indexOf(room);
                    clientLeaving.chatRooms.splice(chatRoomIndex)
                    socket.leave(room);
                }
            })

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

}