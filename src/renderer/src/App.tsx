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
import AddProfessor from "./pages/admin/AddProfessor";
import EditProfessor from "./pages/admin/EditProfessor";
import ManageWorkloads from "./pages/admin/ManageWorkloads";
import PFGHome from "./pages/admin/pfg/Home";
import ManageGroups from "./pages/admin/pfg/ManageGroups";
import ManageStudents from "./pages/admin/pfg/ManageStudents";
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
          <Route path="/admin/addProfessor" element={<AddProfessor />} />
          <Route path="/admin/editProfessor/:id" element={<EditProfessor />} />
          <Route path="/admin/home" element={<AdminHome />} />
          <Route path="/admin/manageUsers" element={<ManageUsers />} />
          <Route path="/admin/editUser/:id" element={<EditUser />} />
          <Route path="/admin/uploadFiles" element={<UploadFiles />} />
          <Route
            path="/admin/manageProfessors"
            element={<ManageProfessors />}
          />
          <Route path="/admin/manageWorkloads" element={<ManageWorkloads />} />
          <Route path="/admin/manageTheses" element={<PFGHome />} />
          <Route path="/admin/manageTheses/groups" element={<ManageGroups />} />
          <Route
            path="/admin/manageTheses/students"
            element={<ManageStudents />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </SessionContextProvider>
  );
}

export default App;
