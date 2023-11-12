import React, { useEffect, useContext } from "react"
import { useParams } from "react-router-dom"
import TitleBar from "../components/TitleBar"
import { useSocket } from "../providers/SocketProvider"
import { UserContext } from "../providers/UserProvider"

import "./Room.css"

const Room = () => {
    const { id } = useParams()
    const { username } = useContext(UserContext)
    const socket = useSocket()

    useEffect(() => {
        console.log(`User [${username}] has joined room: ${id}`)

        //socket.emit("join-room", id, username)
    }, [])

    return (
        <div className="flex-column">
            <TitleBar />

            <div className="container" style={{ padding: "0px", flexDirection: "row" }}>
                <RoomSidebar></RoomSidebar>
                <RoomChat></RoomChat>
            </div>
        </div>
    )
}

const RoomSidebar = ({ children }) => {
    return <div className="room-sidebar">{children}</div>
}

const RoomChat = ({ children }) => {
    return <div className="room-chat">{children}</div>
}

export default Room
