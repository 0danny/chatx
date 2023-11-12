import React, { useEffect, useContext, useRef } from "react"
import { useParams } from "react-router-dom"
import TitleBar from "../components/TitleBar"
import { useSocket } from "../providers/SocketProvider"
import { UserContext } from "../providers/UserProvider"

import "./Room.css"

const Room = () => {
    const { username, setUsername } = useContext(UserContext)
    const { id } = useParams()
    const socket = useSocket()

    var thisPeer = useRef(null)
    var peers = useRef({})
    var hostSocketId = useRef("")
    var hasJoined = useRef(false)

    useEffect(() => {
        if (username.length === 0) return

        runInit()
    }, [username])

    useEffect(() => {
        //Crude way to useEffect from running twice or more than once.

        if (username.length === 0) {
            setUsername("Unknown")

            return
        }

        runInit()
    }, [])

    const runInit = () => {
        if (hasJoined.current) return

        console.log(`User [${username}] has joined room: ${id}`)

        socket.emit("join-room", id, username)
        socket.emit("check-host", id)

        socket.on("whos-host", (hSocketId) => {
            console.log(`The host is -> ${hSocketId}`)

            hostSocketId.current = hSocketId
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
            //If we are the host, set the remote description
            if (socket.id == hostSocketId.current) {
                console.log(`Received local SDP from ${from}, setting remote description.`)

                peers.current[from].setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: sdp }))
            }
        })

        socket.on("remote-description", (sdp, from) => {
            if (from != hostSocketId.current) {
                console.log(`Received remote description from non-host.`)
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

        socket.on("new-user", (data) => {
            if (data.socketId === socket.id) return

            console.log(`New user joined: ${data.socketId} - ${data.username}`)

            //If we are the host, initiate connection to new user.
            if (hostSocketId.current == socket.id) {
                //Exchange webrtc information with new user.

                //Add new user to peers object.
                peers.current[data.socketId] = new RTCPeerConnection({
                    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
                })

                peers.current[data.socketId].onicecandidate = (event) => {
                    if (event.candidate) {
                        //Send ICE Candidates to user we are connecting to.
                        socket.emit("ice-candidate", event.candidate, data.socketId)
                    }
                }

                //Create data channel.
                const channel = peers.current[data.socketId].createDataChannel("chat")

                //Assign the channel to the peer object

                //Create offer and send to new user.
                peers.current[data.socketId]
                    .createOffer()
                    .then((description) => {
                        return peers.current[data.socketId].setLocalDescription(description)
                    })
                    .then(() => {
                        socket.emit(
                            "forward-remote-description",
                            peers.current[data.socketId].localDescription.sdp,
                            data.socketId
                        )
                    })

                peers.current[data.socketId].ondatachannel = (event) => {
                    console.log("Data channel is open and ready to be used.")
                }
            }
        })

        hasJoined.current = true
    }

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
