import React, { useState } from "react";
import Draggable from "react-draggable";
import folder from "../../images/folder.png";
import { useNavigate } from "react-router-dom";

// import useWindowDimensions from "../helpers/windowDimensions";

export default function Home() {
    // const { height, width } = useWindowDimensions();

    const [selected, setSelected] = useState(null);

    let navigate = useNavigate();

    let gridConstant = 25;

    let folders = [
        {
            text: "gym",
        },
        {
            text: "clothing",
        },
        {
            text: "music",
        },

        {
            text: "programming",
        },
    ];

    document.addEventListener("mousedown", (event) => {
        if (!event.target.classList.contains("box")) {
            selected.style.borderStyle = "none";
        }
    });

    return (
        <div className="container">
            <div className="folder-container">
                {folders.map((obj, key) => {
                    return (
                        <Draggable
                            grid={[gridConstant, gridConstant]}
                            key={key}
                            handle="img"
                        >
                            <div className="box">
                                <div className="folder-content">
                                    <img
                                        class="draggable-image"
                                        src={folder}
                                        onClick={(event) => {
                                            if (selected == event.target) {
                                                navigate(obj.text);
                                            } else {
                                                if (selected != null) {
                                                    selected.style.borderStyle =
                                                        "none";
                                                }
                                                setSelected(event.target);
                                                event.target.style.borderStyle =
                                                    "dotted";
                                            }
                                        }}
                                        // onDoubleClick={(event) => {
                                        //     navigate(obj.text);
                                        //     console.log(
                                        //         "doubleclicked " + obj.text
                                        //     );
                                        // }}
                                        // onMouseDown={(event) => {
                                        //     event.target.style.borderStyle =
                                        //         "dotted";
                                        // }}
                                        // onMouseUp={(event) => {
                                        //     event.target.style.borderStyle =
                                        //         "none";
                                        // }}
                                    />
                                    <p>{obj.text}</p>
                                </div>
                            </div>
                        </Draggable>
                    );
                })}
            </div>

            <div className="footer-container">
                <p>
                    t-industries [ti] is not an organization. no rights
                    reserved.
                </p>
            </div>
        </div>
    );
}
