import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentHome from "./pages/student/Home";
import ProfessorHome from "./pages/professor/Home";
import AdminHome from "./pages/admin/Home";
import ManageUsers from "./pages/admin/ManageUsers";
import EditUser from "./pages/admin/EditUser";
import UploadFiles from "./pages/admin/UploadFiles";
import TitleBar from "./components/TitleBar";
import ManageProfessors from "./pages/admin/ManageProfessors";
import ManageStudents from "./pages/admin/ManageStudents";
import NotFound from "./pages/NotFound";
import { SessionContextProvider } from "./context/SessionContext";
import AddProfessor from "./pages/admin/AddProfessor";
import AddStudent from "./pages/admin/AddStudent";
import EditProfessor from "./pages/admin/EditProfessor";
import EditStudent from "./pages/admin/EditStudent";
import ManageWorkloads from "./pages/admin/ManageWorkloads";
import PFGHome from "./pages/admin/pfg/Home";
import ManageGroups from "./pages/admin/pfg/ManageGroups";
import EditGroupProfessors from "./pages/admin/pfg/EditGroupProfessors";
import EditGroupStudents from "./pages/admin/pfg/EditGroupStudents";
import AddCourseActivity from "./pages/admin/AddCourseActivity";
import AddTFGActivity from "./pages/admin/AddTFGActivity";
import AddOtherActivity from "./pages/admin/AddOtherActivity";
import ManageAdvisors from "./pages/admin/pfg/ManageAdvisors";
import ManagePresentations from "./pages/admin/pfg/ManagePresentations";
import Statistics from "./pages/admin/Statistics";
import ExportFiles from "./pages/admin/ExportFiles";
import EditStudentProfessor from "./pages/admin/EditStudentProfessor";
import { PresentationSwapContextProvider } from "./context/PresentationSwapContext";
import AddPresentation from "./pages/admin/pfg/AddPresentation";
import EditPresentation from "./pages/admin/pfg/EditPresentation";
import React from "react";

function App(): React.ReactElement {
  return (
    <SessionContextProvider>
      <TitleBar />
      <main>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/student/home" element={<StudentHome />} />
          <Route path="/professor/home" element={<ProfessorHome />} />
          <Route path="/admin/AddProfessor" element={<AddProfessor />} />
          <Route path="/admin/AddStudent" element={<AddStudent />} />
          <Route path="/admin/editProfessor/:id" element={<EditProfessor />} />
          <Route path="/admin/editStudent/:id" element={<EditStudent />} />
          <Route path="/admin/home" element={<AdminHome />} />
          <Route path="/admin/manageUsers" element={<ManageUsers />} />
          <Route path="/admin/editUser/:id" element={<EditUser />} />
          <Route path="/admin/uploadFiles" element={<UploadFiles />} />
          <Route path="/admin/exportFiles" element={<ExportFiles />} />
          <Route
            path="/admin/manageProfessors"
            element={<ManageProfessors />}
          />
          <Route path="/admin/manageStudents" element={<ManageStudents />} />
          <Route path="/admin/manageWorkloads" element={<ManageWorkloads />} />
          <Route
            path="/admin/addCourseActivity"
            element={<AddCourseActivity />}
          />
          <Route path="/admin/addTFGActivity" element={<AddTFGActivity />} />
          <Route
            path="/admin/addOtherActivity"
            element={<AddOtherActivity />}
          />
          <Route path="/admin/manageTheses" element={<PFGHome />} />
          <Route path="/admin/manageTheses/groups" element={<ManageGroups />} />
          <Route
            path="/admin/manageTheses/groups/editProfessors/:id"
            element={<EditGroupProfessors />}
          />
          <Route
            path="/admin/manageTheses/groups/editStudents/:id"
            element={<EditGroupStudents />}
          />
          <Route
            path="/admin/manageTheses/students"
            element={<ManageStudents />}
          />
          <Route
            path="/admin/manageTheses/advisors"
            element={<ManageAdvisors />}
          />
          <Route
            path="/admin/manageTheses/presentations"
            element={
              <PresentationSwapContextProvider>
                <ManagePresentations />
              </PresentationSwapContextProvider>
            }
          />
          <Route
            path="/admin/manageTheses/presentations/add/:id"
            element={<AddPresentation />}
          />
          <Route
            path="/admin/manageTheses/presentations/edit/:id"
            element={<EditPresentation />}
          />
          <Route path="/admin/statistics" element={<Statistics />} />
          <Route
            path="/admin/manageTheses/editStudentProfessor/:id"
            element={<EditStudentProfessor />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </SessionContextProvider>
  );
}

export default App;
