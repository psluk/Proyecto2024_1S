import { Route, Routes } from "react-router-dom";
import { ShowLogin } from "./global/ShowLogin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentHome from "./pages/student/Home";
import ProfessorerHome from "./pages/professor/Home";
import AdminHome from "./pages/admin/Home";
import Versions from "./components/Versions";

function App(): JSX.Element {
  return (
    <div className="">
      <Routes>
        <Route path="/" element={ShowLogin ? <Login /> : <AdminHome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/versions" element={<Versions/>} />
        <Route path="/student/home" element={<StudentHome />} />
        <Route path="/professor/home" element={<ProfessorerHome />} />
        <Route path="/admin/home" element={<AdminHome />} />
      </Routes>
    </div>
  );
}

export default App;
