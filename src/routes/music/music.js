import React from "react";
import Topbar from "../../components/topbar/topbar";
import Footer from "../../components/footer/footer";

export default function Music() {
    return (
        <div className="page">
            <Topbar path="/" mode="dark" text="home" />
            <div className="text-container">
                <p>2022.04.26 | 0:57</p>
            </div>
            <Footer />
        </div>
    );
}