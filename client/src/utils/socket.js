import io from "socket.io-client";
import Cookies from "js-cookie";

let connectionString;

if (process.env.PUBLIC_URL === '') {
    if (process.env.NODE_ENV === 'production') {
        connectionString = `nicksnpcs.herokuapp.com`
    } else if (process.env.NODE_ENV === 'development') {
        connectionString = "http://localhost:3001"
    }
} else {
    connectionString = process.env.PUBLIC_URL;
}

console.log("connection string:", connectionString)

let socket;

if (Cookies.get('username')) {
    socket = io(connectionString, {
        withCredentials: true,
        extraHeaders: {
            "my-custom-header": "abcd"
        },
        query: { username: Cookies.get('username') }
    });
} else {
    socket = false
}

export default socket;