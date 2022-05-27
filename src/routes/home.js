import React from "react";
import "./home.css";
import Draggable from "react-draggable";
import folder from "../images/folder.png";
// import useWindowDimensions from "../helpers/windowDimensions";

export default function Home() {
    // const { height, width } = useWindowDimensions();

    let gridConstant = 25;

    let folders = [
        {
            text: "gym"
        },
        {
            text: "clothing"
        },
        {
            text: "music"
        },

        {
            text: "programming"
        },
    ];
    return (
        <>
            <div className="center-text">
                <h3>Coming Soon</h3>
                <p className="b">
                    t-industries (ti) is not an organization. no rights
                    reserved.
                </p>
            </div>
            <div className="folder-container">
            {folders.map((obj, key) => {
                return(
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
                                    console.log("doubleclicked");
                                }}
                                onMouseDown={(event) => {
                                    event.target.style.borderStyle = "dotted";
                                }}
                                onMouseUp={(event) => {
                                    event.target.style.borderStyle = "none";
                                }}
                            />
                            <p>{obj.text}</p>
                        </div>
                    </div>
                </Draggable>
                );
            })}
            </div>
        </>
    );
}
