import React, { useState } from "react";
import Cookies from "js-cookie"
import "./style.css"

import thisStartsWithOneOfThese from "../../utils/finding";

function Input({ setMessage, socket, inConversation, input, setInput, rooms, setRooms }) {


    function handleSubmit(e) {
        e.preventDefault();
        if (inConversation && !thisStartsWithOneOfThese(input.toLowerCase(), ['/w', 'whisper', 'say to', 'speak to', 'talk to'])) {
            // if the user is in a conversation with an NPC, emit to the server
            socket.emit('whisper', { userTo: inConversation.with, username: Cookies.get('username'), message: input, rooms });
            setInput('');
        } else {
            // the thisStartsWithOneOfThese function allows for multiple inputs to access a single command
            if (thisStartsWithOneOfThese(input.toLowerCase(), ['join', '/j'])) {
                const room = input.split(' ').slice(1).join(' ');
                socket.emit('join', { room, username: Cookies.get('username') })
                setInput('')
            } else if (thisStartsWithOneOfThese(input.toLowerCase(), ['leave', '/l'])) {
                const room = input.split(' ').slice(1).join(' ');
                socket.emit('leave', { room, username: Cookies.get('username') })
                setInput('')
            } else if (thisStartsWithOneOfThese(input.toLowerCase(), ['whisper', '/w', 'whisper to', 'say to', 'speak to', 'talk to'])) {
                // handles if the user is using the extended whisper command with 'to'
                const whisperMessage = thisStartsWithOneOfThese(input.toLowerCase(), ['whisper to', 'say to', 'speak to', 'talk to']) ? input.split(' ').slice(2).join(' ') : input.split(' ').slice(1).join(' ');

                const userTo = whisperMessage.split(' ')[0];
                const message = whisperMessage.split(' ').slice(1).join(' ');

                socket.emit('whisper', { userTo, message, username: Cookies.get('username'), rooms })
                setInput('')
            } else {
                socket.emit('chat message', { username: Cookies.get('username'), message: input })
                setInput('')
            }
        }
    }

    function handleChange(e) {
        setInput(e.target.value);
    };

    return (
        <form action=""
            onSubmit={handleSubmit}
        >
            <input id="m" autoComplete="off"
                onChange={handleChange}
                value={input}
            /><button>Send</button>
        </form>
    )
}

export default Input;