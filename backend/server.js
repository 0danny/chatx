// Include required modules
const express = require("express")
const http = require("http")
const socketIO = require("socket.io")

// Create an Express application and a HTTP server
const app = express()
const server = http.createServer(app)
const io = socketIO(server)

// Set up a connection event and listen for our custom events
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id)

    socket.on("join room", (room) => {
        console.log(`Socket ${socket.id} joining ${room}`)
        socket.join(room)
        socket.to(room).broadcast.emit("new user", { socketId: socket.id })
    })

    socket.on("ice candidate", (data) => {
        socket.to(data.room).broadcast.emit("ice candidate", {
            candidate: data.candidate,
            socketId: socket.id,
        })
    })

    socket.on("session description", (data) => {
        socket.to(data.room).broadcast.emit("session description", {
            description: data.description,
            socketId: socket.id,
        })
    })

    socket.on("get-rooms", (data) => {
        socket.emit("rooms", io.sockets.adapter.rooms)
    })

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id)
    })
})

server.listen(3000, () => {
    console.log("Server listening on port 3000")
})
