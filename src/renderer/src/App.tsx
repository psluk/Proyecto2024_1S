import { Route, Routes } from "react-router-dom";
import { ShowLogin } from "./global/ShowLogin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentHome from "./pages/student/Home";
import ProfessorerHome from "./pages/professor/Home";
import AdminHome from "./pages/admin/Home";
import ManageUsers from "./pages/admin/ManageUsers";
import EditUser from "./pages/admin/EditUser";
import UploadFiles from "./pages/admin/UploadFiles";

function App(): JSX.Element {
  return (
    <div className="">
      <Routes>
        UploadFiles
        <Route path="/" element={<UploadFiles/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/student/home" element={<StudentHome />} />
        <Route path="/professor/home" element={<ProfessorerHome />} />
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/manageUsers" element={<ManageUsers />} />
        <Route path="/admin/editUser/:userId" element={<EditUser />} />
      </Routes>
    </div>
  );
}

export default App;
