module.exports = function (server) {
    return require('socket.io')(server, {
        cors: {
            origin: ["http://localhost:3000", "http://192.168.1.23:3000"],
            methods: ["GET", "POST"],
            allowedHeaders: ["my-custom-header"],
            credentials: true
        }
    })
}