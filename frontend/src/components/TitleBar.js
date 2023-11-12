import { GiDropletSplash } from "react-icons/gi"

import "./TitleBar.css"

const TitleBar = () => {
    return (
        <div className="title-bar">
            <GiDropletSplash />
            <span>ChatX</span>
        </div>
    )
}

export default TitleBar
