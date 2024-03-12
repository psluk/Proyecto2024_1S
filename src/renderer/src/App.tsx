import { useState } from "react";
import electronLogo from "./assets/electron.svg";
import { Link, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
function App(): JSX.Element {
  return (
    <div className="">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
