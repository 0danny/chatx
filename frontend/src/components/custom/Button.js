const Button = ({ text, onclick, style }) => {
    return (
        <div className="custom-button" onClick={onclick && onclick} style={style}>
            {text}
        </div>
    )
}

export default Button
