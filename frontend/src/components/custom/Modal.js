import { AiOutlineClose } from "react-icons/ai"

const Modal = ({ isOpen, setIsOpen, title, hasExit = true, children }) => {
    const backgroundClick = (event) => {
        if (event.target === event.currentTarget) {
            if (hasExit) {
                setIsOpen(false)
            }
        }
    }

    return (
        <div className={`custom-modal ${isOpen ? "active" : ""}`}>
            <div className="custom-modal-background" onClick={backgroundClick} />

            <div className="custom-modal-content">
                <div className="custom-modal-header">
                    <span>{title}</span>

                    <div
                        className="custom-modal-close"
                        onClick={() => {
                            if (hasExit) {
                                setIsOpen(false)
                            }
                        }}
                    >
                        <AiOutlineClose />
                    </div>
                </div>

                <div className="custom-modal-children">{children}</div>
            </div>
        </div>
    )
}

export default Modal
