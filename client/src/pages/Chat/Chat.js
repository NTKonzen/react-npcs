import React, { useState, useEffect } from "react";
import "./style.css";
// Cookie plugin makes cookies easy
import Cookies from 'js-cookie';
// I had to create a separate socket file to avoid users connecting to multiple sockets
// this ensures there is only one socket instance per client
import { socket } from '../../utils/socket';

function thisStartsWithOneOfThese(string, array) {
    let itDoes = false;
    array.forEach(value => {
        if (string.startsWith(value)) {
            itDoes = true;
        }
    })
    return itDoes;
}

function Chat() {
    const [input, setInput] = useState('');

    const [displays, setDisplays] = useState([]);

    const [message, setMessage] = useState('');

    // runs every time the message state is updated
    useEffect(() => {
        if (message !== '') {
            if (thisStartsWithOneOfThese(input.toLowerCase(), ['join', '/j'])) {
                // Example call: join room1
                socket.emit('join', { room: message, username: Cookies.get('username') })
            } else if (thisStartsWithOneOfThese(input.toLowerCase(), ['leave', '/l'])) {
                // Example call: leave room1
                socket.emit('leave', { room: message, username: Cookies.get('username') })
            } else if (thisStartsWithOneOfThese(input.toLowerCase(), ['whisper', '/w', 'whisper to', 'say to'])) {
                // Example call: /w Nick Hey!
                const userTo = message.split(' ')[0];
                const newMessage = message.split(' ').slice(1).join(' ');

                socket.emit('whisper', { userTo, message: newMessage, username: Cookies.get('username') })
            } else {
                socket.emit('chat message', { username: Cookies.get('username'), message })
                console.log('Log from useEffect')
            }
            setMessage("");
            setInput("");
        }
    }, [message]);

    // socket.off is required cause react is stupid don't ask
    socket.off('join').on('join', function ({ room, userJoining }) {
        // keys are set via the time and received data to ensure that they're unique
        setDisplays(displays.concat(<li key={room + userJoining + new Date().getTime()}>{userJoining} joined {room}</li>))
    });

    socket.off('leave').on('leave', function ({ room, userLeaving }) {
        setDisplays(displays.concat(<li key={room + userLeaving + new Date().getTime()}>{userLeaving} left {room}</li>))
    });

    socket.off('chat message').on('chat message', function ({ username, message }) {
        console.log('chat message received!')
        setDisplays(displays.concat(<li key={username + message + new Date().getTime()}>{username}: {message}</li>))
    });

    socket.off('whisper').on('whisper', function ({ username, message }) {
        setDisplays(displays.concat(<li key={username + message + new Date().getTime()}><i>{username}: {message}</i></li>))
    });

    socket.off('error').on('error', function ({ err }) {
        setDisplays(displays.concat(<li key={err + new Date().getTime()}>{err}</li>))
    });

    function handleChange(e) {
        setInput(e.target.value);
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (thisStartsWithOneOfThese(input.toLowerCase(), ['join', '/j'])) {
            const room = input.split(' ').slice(1).join(' ');
            setMessage(room);
        } else if (thisStartsWithOneOfThese(input.toLowerCase(), ['leave', '/l'])) {
            const room = input.split(' ').slice(1).join(' ');
            setMessage(room);
        } else if (thisStartsWithOneOfThese(input.toLowerCase(), ['whisper', '/w', 'whisper to', 'say to', 'speak to'])) {
            const whisperMessage = thisStartsWithOneOfThese(input.toLowerCase(), ['whisper to', 'say to', 'speak to']) ? input.split(' ').slice(2).join(' ') : input.split(' ').slice(1).join(' ');
            console.log(whisperMessage)
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