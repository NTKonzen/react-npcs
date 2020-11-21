import React, { useEffect } from "react";
import Cookies from "js-cookie"
import "./style.css"

import thisStartsWithOneOfThese from "../../utils/finding";

function Input({ setMessage, socket, inConversation, input, setInput }) {

    function handleSubmit(e) {
        e.preventDefault();
        if (inConversation && !thisStartsWithOneOfThese(input.toLowerCase(), ['/w', 'whisper', 'say to', 'speak to', 'talk to'])) {
            console.log("shouldn't be here")
            // if the user is in a conversation with an NPC, emit to the server
            socket.emit('whisper', { userTo: inConversation.with, username: Cookies.get('username'), message: input });
            setInput('');
        } else {
            // the thisStartsWithOneOfThese function allows for multiple inputs to access a single command
            if (thisStartsWithOneOfThese(input.toLowerCase(), ['join', '/j'])) {
                const room = input.split(' ').slice(1).join(' ');
                setMessage(room);
            } else if (thisStartsWithOneOfThese(input.toLowerCase(), ['leave', '/l'])) {
                const room = input.split(' ').slice(1).join(' ');
                setMessage(room);
            } else if (thisStartsWithOneOfThese(input.toLowerCase(), ['whisper', '/w', 'whisper to', 'say to', 'speak to', 'talk to'])) {
                // handles if the user is using the extended whisper command with 'to'
                const whisperMessage = thisStartsWithOneOfThese(input.toLowerCase(), ['whisper to', 'say to', 'speak to', 'talk to']) ? input.split(' ').slice(2).join(' ') : input.split(' ').slice(1).join(' ');
                setMessage(whisperMessage);
            } else {
                console.log("should be here")
                setMessage(input);
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