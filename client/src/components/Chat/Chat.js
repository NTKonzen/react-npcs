import React from "react";
import Cookies from "js-cookie";
import "./style.css";

import thisStartsWithOneOfThese from "../../utils/finding";

function Chat({ socket, displays, setDisplays, input, setInput, message, setMessage, inConversation, setConversation, rooms, setRooms }) {

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