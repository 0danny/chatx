import React, { createContext, useContext, useEffect, useState } from "react"
import io from "socket.io-client"

// Create a context
const SocketContext = createContext(null)

const socketAddress = "http://localhost:4000"

export const useSocket = () => {
    return useContext(SocketContext)
}

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null)

    useEffect(() => {
        // Connect to Socket.io server
        const newSocket = io(socketAddress, { transports: ["websocket"] })

        setSocket(newSocket)

        return () => newSocket.close()
    }, [])

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}
