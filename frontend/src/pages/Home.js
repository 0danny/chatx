import React, { useEffect, useState, useContext } from "react"

import TitleBar from "../components/TitleBar"
import Button from "../components/custom/Button"
import Modal from "../components/custom/Modal"
import InputGroup from "../components/custom/InputGroup"

import { useSocket } from "../providers/SocketProvider"
import { UserContext } from "../providers/UserProvider"

import { BsFillChatDotsFill } from "react-icons/bs"
import { FaPeopleGroup } from "react-icons/fa6"

import "./Home.css"

const Home = () => {
    const [showModal, setShowModal] = useState(false)
    const { username, setUsername } = useContext(UserContext)
    const [rooms, setRooms] = useState([])
    const socket = useSocket()

    useEffect(() => {
        if (socket) {
            socket.on("room-created", (roomID) => {
                console.log(`Server has created a room at ID: ${roomID}`)

                // Redirect to the room using client side routing
                window.location.href = `#room/${roomID}`
            })

            socket.on("rooms", (rooms) => {
                console.log("Received rooms:", rooms)

                setRooms(rooms)
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

    const roomClicked = (roomID) => {
        console.log(`Joining room ${roomID}`)

        window.location.href = `#room/${roomID}`
    }

    return (
        <div className="flex-column">
            <TitleBar />

            <div className="container">
                <div className="flex-row-width home-title">
                    <BsFillChatDotsFill />
                    <span>Chat Rooms</span>
                </div>

                <Button
                    text={"Start Room"}
                    onclick={() => {
                        setShowModal(true)
                    }}
                    style={{ width: "200px" }}
                />

                <div className="home-rooms-list">
                    {Object.keys(rooms).length === 0 ? (
                        <span>There are currently no rooms.</span>
                    ) : (
                        Object.entries(rooms).map(([key, value]) => {
                            return (
                                <Room
                                    key={key}
                                    roomName={key}
                                    roomCount={value.members.length}
                                    onClick={() => {
                                        roomClicked(key)
                                    }}
                                />
                            )
                        })
                    )}
                </div>
            </div>

            <Modal isOpen={showModal} setIsOpen={setShowModal} title={"Create Room"}>
                <InputGroup>
                    <span>Username </span>
                    <input type="text" placeholder="Username..." value={username} onChange={usernameChanged}></input>
                </InputGroup>

                <Button text={"Create Room"} style={{ marginTop: "20px" }} onclick={createRoom} />
            </Modal>
        </div>
    )
}

const Room = ({ roomName, roomCount, onClick }) => {
    return (
        <div className="home-roomobj-container" onClick={onClick}>
            <span className="home-roomobj-title">{roomName}</span>

            <div className="flex-row home-roomobj-count">
                <FaPeopleGroup />
                <span>{roomCount} people in room</span>
            </div>
        </div>
    )
}

export default Home
