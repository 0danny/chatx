import React, { useState, useRef, useEffect } from "react"
import "./JoinRoom.css"

const JoinRoom = ({ setDataChannel }) => {
    const [remoteOfferSDP, setRemoteOfferSDP] = useState("Paste the remote offer SDP here...")
    const [localSDP, setLocalSDP] = useState("Unknown local SDP.")
    const [iceCandidate, setICECandidate] = useState("")
    const peerConnection = useRef(null)

    const createAnswerClick = () => {
        peerConnection.current
            .createAnswer()
            .then((description) => {
                return peerConnection.current.setLocalDescription(description)
            })
            .then(() => {
                setLocalSDP(peerConnection.current.localDescription.sdp)
            })
    }

    const setRemoteClick = () => {
        if (!peerConnection.current) {
            peerConnection.current = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            })
        }

        peerConnection.current.ondatachannel = (event) => {
            setDataChannel(event.channel)
        }

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                console.log(event.candidate)

                setLocalSDP((prevSDP) => prevSDP + "\nICE Candidate: " + event.candidate.candidate)
            }
        }

        peerConnection.current.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: remoteOfferSDP }))
    }

    const remoteOfferSDPChange = (event) => {
        setRemoteOfferSDP(event.target.value)
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

    return (
        <div className="tab-wrapper">
            <span style={{ marginBottom: "10px" }}>
                Step 3: Peer B sets its remote description to Peer A's local description.
            </span>

            <textarea
                placeholder="Paste the remote offer SDP here..."
                value={remoteOfferSDP}
                onChange={remoteOfferSDPChange}
                rows={10}
            ></textarea>

            <div className="button" onClick={setRemoteClick} style={{ marginBottom: "10px", marginTop: "10px" }}>
                Set Remote Description
            </div>

            <span style={{ marginBottom: "10px" }}>
                Step 4: Peer B creates an answer, sets it as a local description and relays the answer back to Peer A.
            </span>

            <div className="button" onClick={createAnswerClick} style={{ marginBottom: "10px" }}>
                Create Answer & Set
            </div>

            <textarea
                placeholder="The localSDP is displayed here."
                style={{ marginBottom: "10px" }}
                value={localSDP}
                readOnly
                rows={10}
            ></textarea>

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

export default JoinRoom
