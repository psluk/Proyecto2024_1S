import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentHome from "./pages/student/Home";
import ProfessorerHome from "./pages/professor/Home";
import AdminHome from "./pages/admin/Home";
import ManageUsers from "./pages/admin/ManageUsers";
import EditUser from "./pages/admin/EditUser";
import UploadFiles from "./pages/admin/UploadFiles";
import TitleBar from "./components/TitleBar";
import ManageProfessors from "./pages/admin/ManageProfessors";
import NotFound from "./pages/NotFound";
import { SessionContextProvider } from "./context/SessionContext";

function App(): JSX.Element {
  return (
    <SessionContextProvider>
      <TitleBar />
      <main>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/student/home" element={<StudentHome />} />
          <Route path="/professor/home" element={<ProfessorerHome />} />
          <Route path="/admin/home" element={<AdminHome />} />
          <Route path="/admin/manageUsers" element={<ManageUsers />} />
          <Route path="/admin/editUser/:userId" element={<EditUser />} />
          <Route path="/admin/uploadFiles" element={<UploadFiles />} />
          <Route
            path="/admin/manageProfessors"
            element={<ManageProfessors />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </SessionContextProvider>
  );
}

export default App;
