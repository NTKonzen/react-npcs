import io from "socket.io-client";
import Cookies from "js-cookie";

let connectionString;

if (process.env.NODE_ENV === 'production') {
    connectionString = `nicksnpcs.herokuapp.com:${process.env.PORT}`
} else if (process.env.NODE_ENV === 'development') {
    connectionString = "http://localhost:3001"
}

export const socket = io(connectionString, {
    withCredentials: true,
    extraHeaders: {
        "my-custom-header": "abcd"
    },
    query: { username: Cookies.get('username') }
});