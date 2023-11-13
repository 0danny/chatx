import React, { useEffect, useContext, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import TitleBar from "../components/TitleBar"
import { useSocket } from "../providers/SocketProvider"
import { UserContext } from "../providers/UserProvider"

import { BiUserCircle } from "react-icons/bi"

import InputGroup from "../components/custom/InputGroup"
import Button from "../components/custom/Button"
import Modal from "../components/custom/Modal"

import "./Room.css"

const Room = () => {
    const { username, setUsername } = useContext(UserContext)
    const [seeUsernameModal, setSeeUsernameModal] = useState(false)
    const [roomUsers, setRoomUsers] = useState([])
    const [curMessage, setCurMessage] = useState("")
    const [roomMessages, setRoomMessages] = useState([{}])

    const { id } = useParams()
    const socket = useSocket()

    var thisPeer = useRef(null)
    var peers = useRef({})
    var hostSocketId = useRef("")
    var hasJoined = useRef(false)

    //If the username is already set, we can run init.
    useEffect(() => {
        if (username.length !== 0) {
            runInit()
        }
    }, [])

    //If the modal is running, we need to wait for the user to enter a username.
    useEffect(() => {
        if (username.length === 0) {
            //Open the username modal
            setSeeUsernameModal(true)
        } else {
            runInit()
        }
    }, [seeUsernameModal])

    const runInit = () => {
        if (hasJoined.current) return

        console.log(`User [${username}] has joined room: ${id}`)

        socket.emit("join-room", id, username)
        socket.emit("check-host", id)

        socket.on("whos-host", (hSocketId) => {
            console.log(`The host is -> ${hSocketId}`)

            hostSocketId.current = hSocketId
        })

        socket.on("user-disconnected", (newList, disconnectedUserId) => {
            //A user has disconnected.

            console.log("A user has disconnected: ", newList)

            setRoomUsers(newList)

            //Remove peer if host.
            if (socket.id == hostSocketId.current) {
                console.log(`We are the host, removing peer: ${disconnectedUserId}`)

                peers.current[disconnectedUserId].close()

                delete peers.current[disconnectedUserId]
            }
        })

        socket.on("incoming-ice-candidate", (candidate, from) => {
            console.log(`Received ICE candidate from ${from}, adding ->`, candidate)

            if (socket.id == hostSocketId.current) {
                peers.current[from].addIceCandidate(new RTCIceCandidate(candidate))
            } else {
                thisPeer.current.addIceCandidate(new RTCIceCandidate(candidate))
            }
        })

        socket.on("incoming-local-sdp", (sdp, from) => {
            //The server will only every route this emit to the host.
            console.log(`Received local SDP from ${from}, setting remote description: ${sdp}`)

            //If we are the host, set the remote description
            if (socket.id == hostSocketId.current) {
                peers.current[from].setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: sdp }))
            }
        })

        socket.on("incoming-remote-sdp", (sdp, from) => {
            if (from != hostSocketId.current) {
                console.log(`Received remote description from non-host ${from} -> ${sdp}`)
                return
            }

            console.log(`Received remote description from host: `, sdp)

            console.log("We are a normal user, setting up connection to host.")

            thisPeer.current = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            })

            thisPeer.current.onicecandidate = (event) => {
                if (event.candidate) {
                    //Send ICE Candidates to the host.
                    socket.emit("ice-candidate", event.candidate, hostSocketId.current)
                }
            }

            thisPeer.current.ondatachannel = (event) => {
                console.log("Data channel is open and ready to be used.")

                //Add the data channel to the peer.
                thisPeer.current.dataChannel = event.channel

                //Event listener for recieving messages.
                thisPeer.current.dataChannel.onmessage = (event) => {
                    console.log("Message recieved: ", event.data)

                    var data = JSON.parse(event.data)

                    //Add to the messages list.
                    setRoomMessages((roomMessages) => [...roomMessages, data])
                }
            }

            thisPeer.current.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: sdp }))

            //create answer and send to host.
            thisPeer.current
                .createAnswer()
                .then((description) => {
                    return thisPeer.current.setLocalDescription(description)
                })
                .then(() => {
                    //Send local back to host.
                    socket.emit("local-description", thisPeer.current.localDescription.sdp, hostSocketId.current)
                })
        })

        socket.on("new-user", (socketId, users) => {
            //Add all new users to the list.
            console.log("Got new users list: ", users)

            setRoomUsers(users)

            if (socketId === socket.id) return

            console.log(`New user joined: ${socketId}`)

            console.log(`Host Test: ${hostSocketId.current} - ${socket.id}`)

            //If we are the host, initiate connection to new user.
            if (hostSocketId.current == socket.id) {
                //Exchange webrtc information with new user.

                //Add new user to peers object.
                peers.current[socketId] = new RTCPeerConnection({
                    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
                })

                peers.current[socketId].onicecandidate = (event) => {
                    if (event.candidate) {
                        //Send ICE Candidates to user we are connecting to.
                        socket.emit("ice-candidate", event.candidate, socketId)
                    }
                }

                //Create data channel.
                const channel = peers.current[socketId].createDataChannel("chat")

                //Attach the channel to the peer.
                peers.current[socketId].dataChannel = channel

                //Event listener for recieving messages.
                channel.onmessage = (event) => {
                    console.log("Message recieved, relaying: ", event.data)

                    var data = JSON.parse(event.data)

                    //Add to the messages list.
                    setRoomMessages((roomMessages) => [...roomMessages, data])

                    //Relay to all clients.
                    relayMessageToClients(data, socketId)
                }

                //Attach username to the peer.
                peers.current[socketId].username = username

                //Create offer and send to new user.
                peers.current[socketId]
                    .createOffer()
                    .then((description) => {
                        return peers.current[socketId].setLocalDescription(description)
                    })
                    .then(() => {
                        socket.emit(
                            "forward-remote-description",
                            peers.current[socketId].localDescription.sdp,
                            socketId
                        )
                    })

                peers.current[socketId].ondatachannel = (event) => {
                    console.log("Data channel is open and ready to be used.")
                }
            }
        })

        hasJoined.current = true
    }

    const usernameChanged = (e) => {
        setUsername(e.target.value)
    }

    const curMessageChange = (e) => {
        setCurMessage(e.target.value)
    }

    const relayMessageToClients = (message, except) => {
        for (const [key, value] of Object.entries(peers.current)) {
            if (key == except) continue

            console.log(`Sending message to ${key} -> ${value}`)

            value.dataChannel.send(JSON.stringify(message))
        }
    }

    const sendMessage = (e) => {
        //Clear box
        setCurMessage("")

        //If we are host, send to everyone.
        if (socket.id == hostSocketId.current) {
            relayMessageToClients({ message: curMessage, from: username })
        } else {
            //Send to host.
            thisPeer.current.dataChannel.send(JSON.stringify({ message: curMessage, from: username }))
        }

        setRoomMessages((roomMessages) => [...roomMessages, { message: curMessage, from: username }])
    }

    const messageBoxKeyDown = (e) => {
        if (e.key == "Enter") {
            sendMessage()
        }
    }

    return (
        <div className="flex-column">
            <TitleBar />

            <div className="container" style={{ padding: "0px", flexDirection: "row" }}>
                <RoomSidebar>
                    {roomUsers.map((user, index) => {
                        return <RoomUser key={index} username={user} />
                    })}
                </RoomSidebar>

                <RoomChat>
                    <div className="room-chat-messages">
                        {roomMessages.map((message, index) => {
                            //Only render if the message is not empty.
                            if (message.message) {
                                return <RoomMessage key={index} username={message.from} message={message.message} />
                            }
                        })}
                    </div>

                    <div className="room-chat-controls">
                        <input
                            type="text"
                            placeholder="Message..."
                            value={curMessage}
                            onChange={curMessageChange}
                            onKeyDown={messageBoxKeyDown}
                        />
                        <Button text={"Send Message"} onclick={sendMessage} />
                    </div>
                </RoomChat>
            </div>

            <Modal isOpen={seeUsernameModal} setIsOpen={setSeeUsernameModal} hasExit={false} title={"Set Username"}>
                <InputGroup>
                    <span>Username </span>
                    <input type="text" placeholder="Username..." value={username} onChange={usernameChanged}></input>
                </InputGroup>

                <Button
                    text={"Join Room"}
                    style={{ marginTop: "20px" }}
                    onclick={() => {
                        setSeeUsernameModal(false)
                    }}
                />
            </Modal>
        </div>
    )
}

const RoomSidebar = ({ children }) => {
    return <div className="room-sidebar">{children}</div>
}

const RoomMessage = ({ username, message }) => {
    return (
        <div className="room-message">
            <div className="room-message-icon">
                <BiUserCircle />
                <span>{username}</span>
            </div>

            <span>{message}</span>
        </div>
    )
}

const RoomUser = ({ username }) => {
    return (
        <div className="room-user">
            <BiUserCircle />
            <span>{username}</span>
        </div>
    )
}

const RoomChat = ({ children }) => {
    return <div className="room-chat">{children}</div>
}

export default Room
