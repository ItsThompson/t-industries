import React from "react";
import PropTypes from "prop-types";
import Draggable from "react-draggable";
import folder from "../../images/folder.png";
import "./folder.css";

export default function Folder(text) {
    
    return (
            <div className="box">
                <div className="folder-content">
                    <img
                        id="folder-image"
                        src={folder}
                        onDoubleClick={(event) => {
                            console.log("doubleclicked");
                        }}
                        onMouseDown={(event) => {
                            event.target.style.borderStyle = "dotted";
                        }}
                        onMouseUp={(event) => {
                            event.target.style.borderStyle = "none";
                        }}
                    />
                    <p>{text}</p>
                </div>
            </div>
    );
}

Folder.propTypes = {
    text: PropTypes.string.isRequired
};
