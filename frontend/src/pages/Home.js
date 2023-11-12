import TitleBar from "../components/TitleBar"
import Card from "../components/custom/Card"
import Button from "../components/custom/Button"
import { BsFillChatDotsFill } from "react-icons/bs"

import "./Home.css"

const Home = () => {
    return (
        <div className="flex-column">
            <TitleBar />

            <div className="home-container">
                <Card title={"Chat Rooms"} icon={<BsFillChatDotsFill />} style={{ height: "100%" }}>
                    <Button text={"Start Room"} />

                    <div className="home-rooms-list"></div>
                </Card>
            </div>
        </div>
    )
}

const RoomObject = ({ title }) => {}

export default Home
