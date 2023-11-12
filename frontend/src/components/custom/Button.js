const Button = ({ text, onclick }) => {
    return (
        <div className="custom-button" onClick={onclick && onclick}>
            {text}
        </div>
    )
}

export default Button
