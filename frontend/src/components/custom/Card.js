import { AiOutlineFileUnknown } from "react-icons/ai"

const Card = ({ title, icon, style, children }) => {
    return (
        <div className="custom-card" style={style}>
            <div className="custom-card-title">
                {icon ? icon : <AiOutlineFileUnknown />}
                {title ? title : "Card"}
            </div>
            <div className="custom-card-container">{children}</div>
        </div>
    )
}

export default Card
