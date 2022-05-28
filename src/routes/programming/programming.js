import React from "react";
import Topbar from "../../components/topbar/topbar";
import Footer from "../../components/footer/footer";

export default function Programming() {
    return (
        <div className="page">
            <Topbar path="/" mode="dark" text="home" />
            <div className="text-container">
                {/* TODO: MAKE THESE LINKS */}
                {/* NOTE: MAKE THE PROJECTS BE FEATURED PROJECTS NOT LIKE ALL PROJECTS IVE EVER DONE CUZ SOME OF IT IS SHIT LOL */}
                {/* <a href="https://google.com" target="_blank">
                    {">"} Circular motion and gravitation simulation | may 19 22{" "}
                    {"<"}
                </a> */}
                <div className="p-2">
                    <a href="https://youtu.be/7UI9ssHhFkk" target="_blank">
                        {">"} Circular motion and gravitation simulation | may
                        19 22 {"<"}
                    </a>
                </div>
                <div className="p-2">
                    <a href="#">
                        PanopticAI Website | aug 3 21
                    </a>
                </div>
                <div className="p-2">
                    <a href="#">
                        thought | nov 11 20
                    </a>
                </div>
                <div className="p-2">
                    <a href="#">
                        timepulse | oct 11 20
                    </a>
                </div>
                <div className="p-2">
                    <a href="#">
                        Reel Life | aug 01 20
                    </a>
                </div>
                <div className="p-2">
                    <a href="#">
                        This Is A Disaster | jul 12 20
                    </a>
                </div>
                <div className="p-2">
                    <a href="#">
                        Simple, Don't Die | apr 21 20
                    </a>
                </div>
            </div>
            <Footer />
        </div>
    );
}
