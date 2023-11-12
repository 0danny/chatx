import TitleBar from "../components/TitleBar"
import Card from "../components/custom/Card"
import Button from "../components/custom/Button"
import { BsFillChatDotsFill } from "react-icons/bs"
import React, { useEffect, useState, useContext } from "react"
import Modal from "../components/custom/Modal"
import InputGroup from "../components/custom/InputGroup"
import { useSocket } from "../providers/SocketProvider"
import { UserContext } from "../providers/UserProvider"

import "./Home.css"

const Home = () => {
    const [showModal, setShowModal] = useState(false)
    const { username, setUsername } = useContext(UserContext)
    const socket = useSocket()

    useEffect(() => {
        if (socket) {
            socket.on("room-created", (roomID) => {
                console.log(`Server has created a room at ID: ${roomID}`)

                // Redirect to the room using client side routing
                window.location.href = `#room/${roomID}`
            })
        }
    }, [socket])

    const createRoom = () => {
        console.log(`Creating a new room with username: ${username}`)

        socket.emit("create-room")
    }

    const usernameChanged = (e) => {
        setUsername(e.target.value)
    }

    return (
        <div className="flex-column">
            <TitleBar />

            <div className="container">
                <Card title={"Chat Rooms"} icon={<BsFillChatDotsFill />} style={{ height: "100%" }}>
                    <Button
                        text={"Start Room"}
                        onclick={() => {
                            setShowModal(true)
                        }}
                    />

                    <div className="home-rooms-list"></div>
                </Card>
            </div>

            <Modal isOpen={showModal} setIsOpen={setShowModal} title={"Create Room"}>
                <InputGroup>
                    <span>Username </span>
                    <input type="text" placeholder="Username..." value={username} onChange={usernameChanged}></input>
                </InputGroup>

                <Button
                    text={"Create Room"}
                    style={{ marginTop: "20px" }}
                    onclick={() => {
                        createRoom()
                    }}
                />
            </Modal>
        </div>
    )
}

const Room = ({ title }) => {}

export default Home
