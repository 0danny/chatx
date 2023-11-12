import { Routes, Route } from "react-router-dom"
import { SocketProvider } from "./providers/SocketProvider"
import { UserProvider } from "./providers/UserProvider"

import Home from "./pages/Home"
import Front from "./pages/Front"
import Room from "./pages/Room"

function App() {
    return (
        <>
            <SocketProvider>
                <UserProvider>
                    <Routes>
                        <Route exact path="/" element={<Home />} />
                        <Route exact path="/front" element={<Front />} />
                        <Route exact path="/room/:id" element={<Room />} />
                    </Routes>
                </UserProvider>
            </SocketProvider>
        </>
    )
}

export default App
