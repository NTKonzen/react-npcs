module.exports = function (server) {
    return require('socket.io')(server, {
        cors: {
            origin: ["http://localhost:3000", "http://localhost:3001", `https://nicksnpcs.herokuapp.com:${process.env.PORT}`, `http://nicksnpcs.herokuapp.com:${process.env.PORT}`, `nicksnpcs.herokuapp.com:*`],
            methods: ["GET", "POST"],
            allowedHeaders: ["my-custom-header"],
            credentials: true
        }
    })
}