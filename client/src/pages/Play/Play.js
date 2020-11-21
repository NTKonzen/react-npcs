import React, { useState, useEffect } from "react";
import Input from "../../components/Input/Input"
import Chat from "../../components/Chat/Chat"
import "./style.css";
// I had to create a separate socket file to avoid users connecting to multiple sockets
// this ensures there is only one socket instance per client
import socket from '../../utils/socket';

function Play() {
    const [input, setInput] = useState('');

    const [displays, setDisplays] = useState([]);

    const [message, setMessage] = useState('');

    const [inConversation, setConversation] = useState(false);

    const [rooms, setRooms] = useState([])

    useEffect(() => {
        console.log(rooms)
    }, [rooms])

    return (<div>
        <Chat
            socket={socket}
            displays={displays}
            setDisplays={setDisplays}
            inConversation={inConversation}
            setConversation={setConversation}
            input={input}
            setInput={setInput}
            message={message}
            setMessage={setMessage}
            rooms={rooms}
            setRooms={setRooms}
        >
        </Chat>
        <Input
            setMessage={setMessage}
            socket={socket}
            inConversation={inConversation}
            input={input}
            setInput={setInput}
            rooms={rooms}
            setRooms={setRooms}
        ></Input>
    </div>
    )
}

export default Play;