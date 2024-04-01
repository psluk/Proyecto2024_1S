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
import ManageProfessors from "./pages/admin/ManageProfessors";

function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<UploadFiles />} />
      <Route path="/register" element={<Register />} />
      <Route path="/student/home" element={<StudentHome />} />
      <Route path="/professor/home" element={<ProfessorerHome />} />
      <Route path="/admin/home" element={<AdminHome />} />
      <Route path="/admin/manageUsers" element={<ManageUsers />} />
      <Route path="/admin/editUser/:userId" element={<EditUser />} />
      <Route path="/admin/uploadFiles" element={<UploadFiles />} />
      <Route path="/admin/manageProfessors" element={<ManageProfessors />} />
    </Routes>
  );
}

export default App;
