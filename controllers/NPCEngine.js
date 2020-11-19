function thisStartsWithOneOfThese(string, array) {
    let itDoes = false;
    array.forEach(value => {
        if (string.startsWith(value)) {
            itDoes = true;
        }
    })
    return itDoes;
}

let greetingsArray = ['hello', 'hi', 'hey', 'hello?']

module.exports = function (io) {
    io.on('connection', socket => {
        socket.on('to npc', ({ NPCObj, messageFromUser, fromClient }) => {

            let route;
            let exampleResponses;
            let NPCMessage;

            if (messageFromUser.trim() === '' || !messageFromUser || thisStartsWithOneOfThese(messageFromUser.toLowerCase(), greetingsArray)) {
                route = 0;
                NPCMessage = NPCObj.messages[0].message;
                exampleResponses = NPCObj.messages[0].exampleResponses;
            } else {
                NPCObj.messages.forEach(messageObj => {
                    messageObj.allowedResponses.forEach(responseObj => {
                        if (responseObj.responses.includes(messageFromUser.toLowerCase())) {
                            route = responseObj.route;
                            NPCMessage = NPCObj.messages[route].message;
                            exampleResponses = NPCObj.messages[route].exampleResponses;
                        }
                    })
                })
            }

            // console.log(`${npc}: ${message}`);
            io.to(fromClient.username).emit('error', { err: `${NPCObj.primaryName}: ${NPCMessage}` });
            io.to(fromClient.username).emit('error', { err: `Allowed Responses: ${exampleResponses.join(', ')}` })
        })
    })
}