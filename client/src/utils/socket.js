import io from "socket.io-client";
import Cookies from "js-cookie";

let connectionString;

console.log(process.env)

if (process.env.PUBLIC_URL === '') {
    if (process.env.NODE_ENV === 'production') {
        connectionString = `nicksnpcs.herokuapp.com`
    } else if (process.env.NODE_ENV === 'development') {
        connectionString = "http://localhost:3001"
    }
} else {
    connectionString = process.env.PUBLIC_URL;
}

export const socket = io(connectionString, {
    withCredentials: true,
    extraHeaders: {
        "my-custom-header": "abcd"
    },
    query: { username: Cookies.get('username') }
});