import React from "react";
import Topbar from "../../components/topbar/topbar";
import Footer from "../../components/footer/footer";

export default function Clothing() {
    return (
        <div className="page">
            <Topbar path="/" mode="dark" text="home" />
            <div className="text-container">
                <p>no swag yet</p>
            </div>
            <Footer />
        </div>
    );
}
