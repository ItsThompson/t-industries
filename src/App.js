import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./routes/home/home";
import Gym from "./routes/gym/gym";
import Music from "./routes/music/music";
import Clothing from "./routes/clothing/clothing";
import Programming from "./routes/programming/programming";
import "./App.css";

export default function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/gym" element={<Gym />} />
                    <Route path="/clothing" element={<Clothing />} />
                    <Route path="/music" element={<Music />} />
                    <Route path="/programming" element={<Programming />} />
                    {/* <Route
                        path="/profile"
                        element={<Profile value={"VALUE STATED IN INDEX.JS"} />}
                    /> */}
                </Routes>
            </BrowserRouter>
        </>
    );
}
