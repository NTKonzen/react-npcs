import io from "socket.io-client";
import Cookies from "js-cookie";

export const socket = io("http://localhost:3001", {
    withCredentials: true,
    extraHeaders: {
        "my-custom-header": "abcd"
    },
    query: { username: Cookies.get('username') }
});