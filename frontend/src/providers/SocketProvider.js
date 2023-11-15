import React, { createContext, useContext, useEffect, useState } from "react"
import io from "socket.io-client"

// Create a context
const SocketContext = createContext(null)

const devServer = false

const socketAddress = devServer ? "http://localhost" : "https://chatx.dannn.dev"
const socketPath = "/websocket"

export const useSocket = () => {
    return useContext(SocketContext)
}

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null)

    useEffect(() => {
        console.log(`Connecting to ${socketAddress} -> ${socketPath}/socket.io`)

        // Connect to Socket.io server
        const newSocket = io(socketAddress, { transports: ["websocket"], path: `${socketPath}/socket.io` })

        setSocket(newSocket)

        return () => newSocket.close()
    }, [])

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}
