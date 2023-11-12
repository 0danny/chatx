import React, { useState } from "react"
import CreateRoom from "./CreateRoom"
import JoinRoom from "./JoinRoom"
import Chat from "./Chat"

import { Tab, Tabs, TabList, TabPanel } from "react-tabs"
import "react-tabs/style/react-tabs.css"

function App() {
    const [dataChannel, setDataChannel] = useState(null)

    const handleDataChannel = (channel) => {
        setDataChannel(channel)
    }

    return (
        <div className="app">
            <Tabs>
                <TabList>
                    <Tab>Host</Tab>
                    <Tab>Client</Tab>
                </TabList>

                <TabPanel>
                    <CreateRoom setDataChannel={setDataChannel} />
                </TabPanel>

                <TabPanel>
                    <JoinRoom setDataChannel={setDataChannel} />
                </TabPanel>
            </Tabs>

            <div className="seperator" style={{ marginTop: "20px" }}></div>

            <Chat dataChannel={dataChannel} />
        </div>
    )
}

export default App
