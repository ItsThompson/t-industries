import React from "react";
import Topbar from "../../../components/topbar/topbar";
import Footer from "../../../components/footer/footer";

// import useWindowDimensions from "../helpers/windowDimensions";

export default function Evo() {
    // const { height, width } = useWindowDimensions();
    return (
        <div className="page">
            <Topbar path="/gym" mode="dark" text="gym" />
            <div className="text-container">
                {/* <div>
                    <h3>July 2022</h3>
                </div>
                <div>
                    <h3>June 2022</h3>
                </div> */}
                <div>
                    <h3>May 2022</h3>
                    <p>May 23: Started six_day_workout (65.7)</p>
                </div>
            </div>
            <Footer />
        </div>
    );
}
