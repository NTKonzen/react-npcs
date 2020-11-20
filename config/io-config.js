module.exports = function (server) {
    return require('socket.io')(server, {
        cors: {
            origin: ["http://localhost:3000", `nicksnpcs.herokuapp.com:${process.env.PORT}`],
            methods: ["GET", "POST"],
            allowedHeaders: ["my-custom-header"],
            credentials: true
        }
    })
}