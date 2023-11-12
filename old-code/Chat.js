import "./Chat.css"

import React, { useState, useEffect } from "react"

const Chat = ({ dataChannel }) => {
    const [chatMessage, setChatMessage] = useState("")

    //List of strings
    const [chatHistory, setChatHistory] = useState([])

    const chatMessageChange = (event) => {
        setChatMessage(event.target.value)
    }

    const sendChatMessage = () => {
        if (dataChannel) {
            dataChannel.send(chatMessage)
            setChatMessage("")

            //Add to chatHistory list
            setChatHistory((prevHistory) => [...prevHistory, chatMessage])
        }
    }

    useEffect(() => {
        if (dataChannel) {
            dataChannel.onmessage = (event) => {
                //Add to chatHistory list
                setChatHistory((prevHistory) => [...prevHistory, event.data])
            }

            dataChannel.onopen = () => {
                console.log("Data channel is open and ready to be used.")
            }

            dataChannel.onclose = () => {
                console.log("Data channel is closed.")
            }
        }
    }, [dataChannel])

    return (
        <div className="chat">
            <h1 style={{ textAlign: "center" }}>Chat</h1>

            <div className="chat-controls" style={{ marginBottom: "10px" }}>
                <input
                    type="text"
                    placeholder="Chat message goes here."
                    value={chatMessage}
                    onChange={chatMessageChange}
                ></input>

                <div className="button" onClick={sendChatMessage}>
                    Send Message
                </div>
            </div>

            <textarea
                placeholder="Chat messages appear here."
                value={chatHistory.join("\n")}
                readOnly
                rows={10}
            ></textarea>
        </div>
    )
}

export default Chat
