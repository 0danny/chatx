import { Routes, Route } from "react-router-dom"
import { SocketProvider } from "./providers/SocketProvider"

import Home from "./pages/Home"
import Front from "./pages/Front"

function App() {
    return (
        <>
            <SocketProvider>
                <Routes>
                    <Route exact path="/" element={<Home />} />
                    <Route exact path="/front" element={<Front />} />
                </Routes>
            </SocketProvider>
        </>
    )
}

export default App
