import React from "react";
import { Link, Redirect } from "react-router-dom";
import "./topbar.css";

export default function Topbar() {
    return (
        <div className="topbar">
            <Link to="/" className="topbar-link">
                <h6 className="topbar-h6">← Home</h6>
            </Link>
        </div>
    );
}
