import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export default function Topbar({ path, mode, text }) {

    let cssClass = "";

    if(mode == "light"){
        cssClass = "topbar-link-light";
    }

    if(mode == "dark"){
        cssClass = "topbar-link";
    }
    
    return (
        <div className="topbar">
            <Link to={path} className={cssClass}>
                <h6 className="topbar-h6">← {text}</h6>
            </Link>
        </div>
    );
}

Topbar.propTypes = {
    path: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
};
