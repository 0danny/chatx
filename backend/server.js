// Include required modules
const express = require("express")
const http = require("http")
const socketIO = require("socket.io")
const { v4: uuidv4 } = require("uuid")

// Create an Express application and a HTTP server
const app = express()
const server = http.createServer(app)
const io = socketIO(server)

const PORT = 4000

const getAllRooms = () => {
    const rooms = {}
    io.sockets.adapter.rooms.forEach((value, key) => {
        // Check if the key starts with "room-"
        if (!key.startsWith("chatx-")) return

        rooms[key] = {
            members: Array.from(value),
        }
    })
    return rooms
}

// Set up a connection event and listen for our custom events
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id)

    socket.on("create-room", () => {
        //Create a new room using UUID V4
        const room = `chatx-${uuidv4()}`

        console.log(`Socket ${socket.id} creating new room ${room}`)
        socket.join(room)
        socket.emit("room-created", room)

        //Print out list of all rooms, with users and room names
        console.log(getAllRooms())
    })

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

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})
