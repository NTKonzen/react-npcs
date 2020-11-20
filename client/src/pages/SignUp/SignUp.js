import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import Cookies from 'js-cookie';
import "./style.css";

function SignUp() {

    const [input, setInput] = useState('');

    const [displays, setDisplays] = useState([<li key={new Date().getTime()}>Enter a username to sign up!</li>])

    function handleChange(e) {
        setInput(e.target.value);
    };

    function handleSubmit(e) {
        Cookies.set('username', input, { expires: 7 })
        return <Redirect to="/"></Redirect>
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

export default SignUp;