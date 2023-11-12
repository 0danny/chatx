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
    socket.isHost = false

    socket.on("create-room", () => {
        //Create a new room using UUID V4
        const room = `chatx-${uuidv4()}`

        socket.isHost = true

        console.log(`Socket ${socket.id} creating new room ${room}`)
        socket.join(room)
        socket.emit("room-created", room)

        //Print out list of all rooms, with users and room names
        console.log(getAllRooms())
    })

    socket.on("local-description", (sdp, to) => {
        io.to(to).emit("incoming-local-sdp", sdp, socket.id)
    })

    socket.on("check-host", (room) => {
        console.log(`Finding socket id of host in ${room}`)

        //Find the host socket id in the room
        const hostSocketId = Array.from(io.sockets.adapter.rooms.get(room)).find((id) => {
            return io.sockets.sockets.get(id).isHost
        })

        console.log(`Found host socket id: ${hostSocketId}`)

        //If the current socket id is the host socket id, then we are the host.
        socket.emit("whos-host", hostSocketId)
    })

    socket.on("join-room", (room, username) => {
        console.log(`User ${socket.id} joining ${room} -> isHost: ${socket.isHost}`)

        if (room) {
            socket.join(room)
            io.to(room).emit("new-user", { socketId: socket.id, username: username })
        }
    })

    socket.on("ice-candidate", (candidate, to) => {
        io.to(to).emit("incoming-ice-candidate", candidate, socket.id)
    })

    socket.on("forward-remote-description", (sdp, to) => {
        io.to(to).emit("remote-description", sdp, socket.id)
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
