import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./routes/home";
import "./App.css";

export default function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    {/* <Route
                        path="/profile"
                        element={<Profile value={"VALUE STATED IN INDEX.JS"} />}
                    /> */}
                </Routes>
            </BrowserRouter>
        </>
    );
}
