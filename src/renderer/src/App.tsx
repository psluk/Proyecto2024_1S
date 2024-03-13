import { Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Versions from "./components/Versions";

function App(): JSX.Element {
  return (
    <div className="">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/versions" element={<Versions/>} />
      </Routes>
    </div>
  );
}

export default App;
