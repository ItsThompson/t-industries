import React, { useState } from "react";
import Draggable from "react-draggable";
import text from "../../images/text.png";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/topbar/topbar";

// import useWindowDimensions from "../helpers/windowDimensions";

export default function Gym() {
    // const { height, width } = useWindowDimensions();

    const [selected, setSelected] = useState(null);

    let navigate = useNavigate();

    let gridConstant = 25;

    let folders = [
        {
            text: "six_day_workout",
        },
        {
            text: "evo",
        },
    ];

    document.addEventListener("mousedown", (event) => {
        if (!event.target.classList.contains("box")) {
            selected.style.borderStyle = "none";
        }
    });

    return (
        <div className="container">
            <Topbar path="/" mode="light" text="home" />
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
                                        src={text}
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
