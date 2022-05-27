import React from "react";
import "./home.css";
import Draggable from "react-draggable";
import folder from "../../images/folder.png";
import { useNavigate } from "react-router-dom";

// import useWindowDimensions from "../helpers/windowDimensions";

export default function Home() {
    // const { height, width } = useWindowDimensions();

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
    return (
        <div className="container">
            <div className="folder-container">
                {folders.map((obj, key) => {
                    return (
                        <Draggable
                            grid={[gridConstant, gridConstant]}
                            key={key}
                        >
                            <div className="box">
                                <div className="folder-content">
                                    <img
                                        id="folder-image"
                                        src={folder}
                                        onDoubleClick={(event) => {
                                            navigate(obj.text);
                                            console.log(
                                                "doubleclicked " + obj.text
                                            );
                                        }}
                                        onMouseDown={(event) => {
                                            event.target.style.borderStyle =
                                                "dotted";
                                        }}
                                        onMouseUp={(event) => {
                                            event.target.style.borderStyle =
                                                "none";
                                        }}
                                    />
                                    <p>{obj.text}</p>
                                </div>
                            </div>
                        </Draggable>
                    );
                })}
            </div>

            <div className="center-text footer-container">
                <p>
                    t-industries [ti] is not an organization. no rights
                    reserved.
                </p>
            </div>
        </div>
    );
}
