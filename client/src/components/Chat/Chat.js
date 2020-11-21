import React, { useEffect } from "react";
import Cookies from "js-cookie";
import "./style.css";

import thisStartsWithOneOfThese from "../../utils/finding";

function Chat({ socket, displays, setDisplays, input, setInput, message, setMessage, inConversation, setConversation, rooms, setRooms }) {

    // runs every time the message state is updated
    useEffect(() => {
        if (message !== '') {
            if (thisStartsWithOneOfThese(input.toLowerCase(), ['join', '/j'])) {
                // Example call: join room1
                socket.emit('join', { room: message, username: Cookies.get('username') })
            } else if (thisStartsWithOneOfThese(input.toLowerCase(), ['leave', '/l'])) {
                // Example call: leave room1
                socket.emit('leave', { room: message, username: Cookies.get('username') })
            } else if (thisStartsWithOneOfThese(input.toLowerCase(), ['whisper', '/w', 'whisper to', 'say to', 'speak to', 'talk to'])) {
                // Example call: /w Nick Hey!
                const userTo = message.split(' ')[0];
                const newMessage = message.split(' ').slice(1).join(' ');

                socket.emit('whisper', { userTo, message: newMessage, username: Cookies.get('username'), rooms })
            } else {
                // if the inputted string doesn't start with a recognized command, this runs by default
                socket.emit('chat message', { username: Cookies.get('username'), message })
            }
            setMessage("");
            setInput("");
        }
    }, [message]);

    // socket.off is required cause react is stupid don't ask
    socket.off('join').on('join', function ({ room, userJoining }) {
        if (userJoining === Cookies.get('username')) setRooms(rooms.concat(room));
        // keys are set via the time and received data to ensure that they're unique
        setDisplays(displays.concat(<li key={room + userJoining + new Date().getTime()}>{userJoining} joined {room}</li>))
    });

    socket.off('leave').on('leave', function ({ room, userLeaving }) {
        if (userLeaving === Cookies.get('username')) setRooms(rooms.filter(r => r !== room));
        setDisplays(displays.concat(<li key={room + userLeaving + new Date().getTime()}>{userLeaving} left {room}</li>))
    });

    socket.off('chat message').on('chat message', function ({ username, message }) {
        setDisplays(displays.concat(<li key={username + message + new Date().getTime()}>{username}: {message}</li>))
    });

    socket.off('whisper').on('whisper', function ({ username, message }) {
        setDisplays(displays.concat(<li key={username + message + new Date().getTime()}><i>{username}: {message}</i></li>))
    });

    socket.off('from NPC').on('from NPC', function ({ NPCName, NPCMessage, exampleResponses, leavingConversation }) {

        let npcElementArray = [<li key={NPCName + NPCMessage + new Date().getTime()}><b>{NPCName}: {NPCMessage}</b></li>]

        // the leavingConversation is determined in the NPCEngine
        if (!leavingConversation) {
            npcElementArray.push(<li key={exampleResponses + new Date().getTime()}>Allowed Responses: {exampleResponses}</li>)
            setConversation({ with: NPCName.toLowerCase() })
        } else {
            setConversation(false)
        }

        setDisplays(displays.concat(npcElementArray));
    })

    socket.off('error').on('error', function ({ err }) {
        setDisplays(displays.concat(<li key={err + new Date().getTime()}>{err}</li>))
    });
    return (
        <ul id="messages">
            {displays.map(display => {
                return display
            })}
        </ul>
    )
}

export default Chat;