import React, { useState, useEffect } from "react";
// import io from "socket.io-client";
import "./style.css";
import Cookies from 'js-cookie';
import { socket } from '../../utils/socket';

function Chat() {
    const [input, setInput] = useState('');

    const [displays, setDisplays] = useState([]);

    const [message, setMessage] = useState('');

    useEffect(() => {
        if (message !== '') {
            if (input.startsWith('join')) {
                socket.emit('join', { room: message, username: Cookies.get('username') })
            } else if (input.startsWith('/w')) {
                const userTo = message.split(' ')[0];
                const newMessage = message.split(' ').slice(1).join(' ');

                socket.emit('whisper', { userTo, message: newMessage, username: Cookies.get('username') })
            } else {
                socket.emit('chat message', { username: Cookies.get('username'), message })
                console.log('Log from useEffect')
            }
            setMessage("")
            setInput("")
        }
    }, [message]);

    socket.off('join').on('join', function ({ room, userJoining }) {
        setDisplays(displays.concat(<li key={room + userJoining + new Date().getTime()}>{userJoining} joined {room}</li>))
    });

    socket.off('chat message').on('chat message', function ({ username, message }) {
        console.log('chat message received!')
        setDisplays(displays.concat(<li key={username + message + new Date().getTime()}>{username}: {message}</li>))
    });

    socket.off('whisper').on('whisper', function ({ username, message }) {
        setDisplays(displays.concat(<li key={username + message + new Date().getTime()}><i>{username}: {message}</i></li>))
    });

    function handleChange(e) {
        setInput(e.target.value);
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (input.startsWith('join')) {
            const room = input.split(' ').slice(1).join('');
            setMessage(room);
        } else if (input.startsWith('/w')) {
            const whisperMessage = input.split(' ').slice(1).join(' ');
            setMessage(whisperMessage);
        } else {
            setMessage(input);
        }
    }

    return (<div>
        <ul id="messages">
            {displays.map(display => {
                return display
            })}
        </ul>
        <form action="" onSubmit={handleSubmit}>
            <input id="m" autoComplete="off" onChange={handleChange} value={input} /><button>Send</button>
        </form>
    </div>
    )
}

export default Chat;