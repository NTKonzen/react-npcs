// const clientIO = require('socket.io-client')
const handleNPCs = require('../controllers/NPCEngine');

// Here I'm creating a client object that stores all the active clients on the server because I'm too lazy to set up a mongo database for this
const clients = new Object();
const NPCs = [
    {
        "names": ['ford', 'clerk', 'towel'],
        "primaryName": "Ford",
        "inRoom": 'the lobby',
        id: 1,
        messages: [
            { // 0
                message: 'Hi welcome to the Inn... what can I do for you I guess...',
                exampleResponses: ["Where am I?", "Who are you?", "Goodbye"],
                allowedResponses: [{
                    "responses": ["where am i", "where am i?"],
                    "route": 1
                }, {
                    "responses": ["who are you", "who are you?"],
                    "route": 2
                }, {
                    "responses": ["goodbye", "bye"],
                    "route": 5
                }]
            },
            { // 1
                message: "Didn't I just tell you? You're in the Inn! It's just down the road from the Town and east of the Pumpkin Patch...",
                exampleResponses: ["The Inn?", "Who are you?", "Goodbye"],
                allowedResponses: [{
                    "responses": ["who are you", "who are you?", "who"],
                    "route": 2
                }, {
                    "responses": ["goodbye", "bye"],
                    "route": 5
                }, {
                    responses: ["the inn?", "the inn"],
                    route: 3
                }]
            },
            { // 2
                message: "The name's Ford and despite my appearance, I'm actually just an intricately folded towel... don't ask",
                exampleResponses: ["Where am I?", "You're a towel?", "Goodbye"],
                allowedResponses: [{
                    "responses": ["where am i", "where am i?"],
                    "route": 1
                }, {
                    "responses": ["goodbye", "bye"],
                    "route": 5
                }, {
                    responses: ["you're a towel?", "you're a towel", "youre a towel", "youre a towel?", "your a towel", "your a towel?", "a towel", "a towel?", "towel", "as a towel?", "as a towel"],
                    route: 4
                }]
            },
            { // 3
                message: "You know, the Inn at the Edge of Copyright! The infinitely infamous pit stop where various travellers from around the universe take rest. Most of you I see only once and then you disappear beyond the crossroads. In fact, I’m the only one to have ever returned, as a towel no less!",
                exampleResponses: ["You're a towel?", "Disappearances?", "Who are you?", "Goodbye"],
                allowedResponses: [{
                    responses: ["you're a towel?", "you're a towel", "youre a towel", "youre a towel?", "your a towel", "your a towel?", "a towel", "a towel?", "towel", "as a towel?", "as a towel"],
                    route: 4
                }, {
                    "responses": ["who are you", "who are you?"],
                    "route": 2
                }, {
                    "responses": ["goodbye", "bye"],
                    "route": 5
                }, {
                    "responses": ["disappearances", "disappearances?", "disappear", "disappear?", "dissapearances", "dissapearances?", "dissapear", "dissapear?", "dissappearances", "dissappearances?", "dissappear", "dissappear?"],
                    "route": 6
                }]
            },
            { // 4
                message: "Most of you don’t ask me that question thinking it rather rude… but between you and me I can not shake the experience of turning into this form. It happened just up there you know... *points to the sky and shudders*",
                exampleResponses: ["Where am I?", "Who are you?", "Goodbye"],
                allowedResponses: [{
                    "responses": ["where am i", "where am i?"],
                    "route": 1
                }, {
                    "responses": ["who are you", "who are you?"],
                    "route": 2
                }, {
                    "responses": ["goodbye", "bye"],
                    "route": 5
                }]
            },
            { // 5
                message: "Before you leave, be sure to check your pockets.  The Infinite Improbability Drive from the Heart-of-Gold does strange things and you may have a helpful item in there, or just pocket lint.",
                exampleResponses: ["Where am I?", "Who are you?"],
                allowedResponses: [{
                    "responses": ["where am i", "where am i?"],
                    "route": 1
                }, {
                    "responses": ["who are you", "who are you?"],
                    "route": 2
                }]
            },
            { // 6
                message: "I dare not mention more, it brings back too many troubling memories…. Some fond ones sure, like Arthur and that magnificent invention called a sandwich… oh hey you’re a sandwich-maker. Can you make me a sandwich?",
                exampleResponses: ["Here's your sandwich!", "No thanks"],
                allowedResponses: [{
                    "responses": ["here's your sandwich!", "heres your sandwich", "sandwich"],
                    "route": 7
                }, {
                    "responses": ["no thanks"],
                    "route": 8
                }]
            },
            { // 7
                message: "Such a Hoopy Frood you are!",
                exampleResponses: ["Where am I?", "Who are you?", "Goodbye"],
                allowedResponses: [{
                    "responses": ["where am i", "where am i?"],
                    "route": 1
                }, {
                    "responses": ["who are you", "who are you?"],
                    "route": 2
                }, {
                    "responses": ["goodbye", "bye"],
                    "route": 5
                }]
            },
            { // 8
                message: "Oh well, maybe I can find Arthur and get one",
                exampleResponses: ["Where am I?", "Who are you?", "Goodbye"],
                allowedResponses: [{
                    "responses": ["where am i", "where am i?"],
                    "route": 1
                }, {
                    "responses": ["who are you", "who are you?"],
                    "route": 2
                }, {
                    "responses": ["goodbye", "bye"],
                    "route": 5
                }]
            },
        ]
    },
]

function checkIfStartsWithNPC(message) {
    return new Promise((res, rej) => {
        let startsWithNPC = false;
        let NPCObj;

        if (message.startsWith("the")) {
            // removes the
            message = message.split(' ').slice(1).join(' ');
        }

        // This runs three times!
        for (let i = 2; i >= 0; i--) {
            const messageString = message.toLowerCase().split(' ').slice(0, i + 1).join(' ');
            NPCs.forEach(NPC => {
                if (NPC.names.includes(messageString)) {
                    startsWithNPC = true;
                    NPCObj = NPC;
                    message = message.split(' ').slice(i + 1).join(' ');
                }
            })
        }

        if (startsWithNPC) {
            res({ NPCObj, message })
        } else {
            rej({ status: 404, message: "Doesn't start with NPC" })
        }
    })

}

function thisStartsWithOneOfThese(string, array) {
    let itDoes = false;
    array.forEach(value => {
        if (string.startsWith(value)) {
            itDoes = true;
        }
    })
    return itDoes;
}

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

                checkIfStartsWithNPC(`${userTo} ${message}`)
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
                            io.to(username).emit('error', { err: `You can't whisper to somebody that doesn't exist!` })
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