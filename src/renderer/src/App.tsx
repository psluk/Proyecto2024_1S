import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import UploadFiles from "./pages/UploadFiles";
import TitleBar from "./components/TitleBar";
import ManageProfessors from "./pages/ManageProfessors";
import ManageStudents from "./pages/ManageStudents";
import NotFound from "./pages/NotFound";
import AddProfessor from "./pages/AddProfessor";
import AddStudent from "./pages/AddStudent";
import EditProfessor from "./pages/EditProfessor";
import EditStudent from "./pages/EditStudent";
import ManageWorkloads from "./pages/ManageWorkloads";
import PFGHome from "./pages/pfg/Home";
import ManageGroups from "./pages/pfg/ManageGroups";
import EditGroupProfessors from "./pages/pfg/EditGroupProfessors";
import EditGroupStudents from "./pages/pfg/EditGroupStudents";
import AddCourseActivity from "./pages/AddCourseActivity";
import AddTFGActivity from "./pages/AddTFGActivity";
import AddOtherActivity from "./pages/AddOtherActivity";
import ManageAdvisors from "./pages/pfg/ManageAdvisors";
import ManagePresentations from "./pages/pfg/ManagePresentations";
import Statistics from "./pages/Statistics";
import ExportFiles from "./pages/ExportFiles";
import EditStudentProfessor from "./pages/EditStudentProfessor";
import { PresentationSwapContextProvider } from "./context/PresentationSwapContext";
import AddPresentation from "./pages/pfg/AddPresentation";
import EditPresentation from "./pages/pfg/EditPresentation";
import React from "react";

function App(): React.ReactElement {
  return (
    <>
      <TitleBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/professors/add" element={<AddProfessor />} />
          <Route path="/manageTheses/students/add" element={<AddStudent />} />
          <Route path="/professors/edit/:id" element={<EditProfessor />} />
          <Route
            path="/manageTheses/students/edit/:id"
            element={<EditStudent />}
          />
          <Route path="/uploadFiles" element={<UploadFiles />} />
          <Route path="/exportFiles" element={<ExportFiles />} />
          <Route path="/professors" element={<ManageProfessors />} />
          <Route
            path="/professors/manageWorkloads"
            element={<ManageWorkloads />}
          />
          <Route
            path="/professors/manageWorkloads/addCourseActivity"
            element={<AddCourseActivity />}
          />
          <Route
            path="/professors/manageWorkloads/addTFGActivity"
            element={<AddTFGActivity />}
          />
          <Route
            path="/professors/manageWorkloads/addOtherActivity"
            element={<AddOtherActivity />}
          />
          <Route path="/manageTheses" element={<PFGHome />} />
          <Route path="/manageTheses/groups" element={<ManageGroups />} />
          <Route
            path="/manageTheses/groups/editProfessors/:id"
            element={<EditGroupProfessors />}
          />
          <Route
            path="/manageTheses/groups/editStudents/:id"
            element={<EditGroupStudents />}
          />
          <Route path="/manageTheses/students" element={<ManageStudents />} />
          <Route path="/manageTheses/advisors" element={<ManageAdvisors />} />
          <Route
            path="/manageTheses/presentations"
            element={
              <PresentationSwapContextProvider>
                <ManagePresentations />
              </PresentationSwapContextProvider>
            }
          />
          <Route
            path="/manageTheses/presentations/add/:id"
            element={<AddPresentation />}
          />
          <Route
            path="/manageTheses/presentations/edit/:id"
            element={<EditPresentation />}
          />
          <Route path="/statistics" element={<Statistics />} />
          <Route
            path="/manageTheses/editStudentProfessor/:id"
            element={<EditStudentProfessor />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
