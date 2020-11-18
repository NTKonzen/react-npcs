module.exports = function (io) {
    setTimeout(() => {
        io.emit('error', { err: "Hello world" });
    }, 5000)
    io.on('connection', function (socket) {
        socket.on('chat message', () => {
            console.log('Hello from backEngine!')
        })
    })
}