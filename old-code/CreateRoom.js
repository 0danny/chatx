import React, { useState, useRef, useEffect } from "react"
import "./CreateRoom.css"

const CreateRoom = ({ setDataChannel }) => {
    const [localSDP, setLocalSDP] = useState("Unknown local SDP.")
    const [remoteSDP, setRemoteSDP] = useState("Paste the remote offer SDP here...")
    const [iceCandidate, setICECandidate] = useState("")
    const peerConnection = useRef(null)

    const createOfferClick = () => {
        peerConnection.current = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        })

        const channel = peerConnection.current.createDataChannel("chat")
        setDataChannel(channel)

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                console.log(event.candidate)
                setLocalSDP((prevSDP) => prevSDP + "\nICE Candidate: " + event.candidate.candidate)
            }
        }

        peerConnection.current
            .createOffer()
            .then((description) => {
                return peerConnection.current.setLocalDescription(description)
            })
            .then(() => {
                setLocalSDP(peerConnection.current.localDescription.sdp)
            })

        peerConnection.current.oniceconnectionstatechange = () => {
            console.log(`ICE connection state: ${peerConnection.current.iceConnectionState}`)
            if (
                peerConnection.current.iceConnectionState === "connected" ||
                peerConnection.current.iceConnectionState === "completed"
            ) {
                console.log("Peer-to-peer connection established!")
            } else if (
                peerConnection.current.iceConnectionState === "disconnected" ||
                peerConnection.current.iceConnectionState === "failed" ||
                peerConnection.current.iceConnectionState === "closed"
            ) {
                console.error("Peer-to-peer connection failed or closed.")
            }
        }
    }

    const setRemoteClick = () => {
        console.log(`Set remote SDP: ${remoteSDP}`)

        if (!peerConnection.current) {
            console.log("Peer connection has not been created.")
            return
        }

        peerConnection.current
            .setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: remoteSDP }))
            .then(() => {
                console.log("Remote SDP set.")
            })
            .catch((error) => {
                console.error("Failed to set remote description:", error)
            })
    }

    const addICEClick = () => {
        if (!peerConnection.current) {
            console.log("Peer connection has not been created.")
            return
        }

        const candidate = new RTCIceCandidate({ sdpMLineIndex: 0, candidate: iceCandidate })

        peerConnection.current
            .addIceCandidate(candidate)
            .then(() => {
                console.log("ICE candidate added.")
            })
            .catch((error) => {
                console.error("Failed to add ICE candidate:", error)
            })
    }

    const iceTextChange = (event) => {
        setICECandidate(event.target.value)
    }

    const remoteSDPChange = (event) => {
        setRemoteSDP(event.target.value)
    }

    return (
        <div className="tab-wrapper">
            <span style={{ marginBottom: "10px" }}>
                Step 1: Peer A creates an offer and sets it as the local description.
            </span>
            <div className="button" style={{ marginBottom: "15px" }} onClick={createOfferClick}>
                Create Offer & Set
            </div>
            <textarea placeholder="The localSDP is displayed here." value={localSDP} readOnly rows={10}></textarea>
            <span style={{ marginBottom: "10px", marginTop: "10px" }}>
                Step 2: Peer A sends its local description to Peer B.
            </span>
            <textarea
                placeholder="Paste the remote offer SDP here..."
                value={remoteSDP}
                onChange={remoteSDPChange}
                rows={10}
            ></textarea>
            <span style={{ marginBottom: "10px", marginTop: "10px" }}>
                Step 5: Peer A sets its remote description to Peer B's answer.
            </span>
            <div className="button" style={{ marginBottom: "15px" }} onClick={setRemoteClick}>
                Set Remote SDP
            </div>
            <div className="seperator"></div>

            <div className="button" style={{ marginTop: "10px" }} onClick={addICEClick}>
                Add ICE Candidate
            </div>

            <input
                type="text"
                style={{ marginTop: "10px" }}
                placeholder="Put ICE candidate here..."
                onChange={iceTextChange}
            ></input>
        </div>
    )
}

export default CreateRoom
