import MainController from "../../../../controllers/MainController";
import FileSelector from "@renderer/components/FileSelector";
import { useState } from "react";

export default function UploadFiles(): JSX.Element {
  const [professorsFile, setProfessorsFile] = useState<File | null>(null);
  const [studentsFile, setStudentsFile] = useState<File | null>(null);

  const handleProfessorsFile = async () => {
    try {
      if (professorsFile) {
        const data = await professorsFile.arrayBuffer();
        MainController.uploadProfessorsFile(data);
        alert("Se han cargado los datos correctamente");
      }
    } catch (error) {
      alert("Error en la carga del archivo: " + error);
    }
  };

  const handleStudentsFile = async () => {
    try {
      if (studentsFile) {
        const data = await studentsFile.arrayBuffer();
        console.log(data);
        //MainController.uploadStudentsFile(data);
      }
    } catch (error) {
      alert("Error en la carga del archivo: " + error);
    }
  };

  return (
    <main className="flex flex-col items-center gap-10">
      <h3 className="mb-10 text-3xl font-bold text-sky-700">
        MÓDULO DE CARGA DE DATOS
      </h3>
      <div className="flex justify-center">
        <div className="mr-3 flex flex-col items-start items-center justify-center rounded-md bg-sky-200 p-4 text-left">
          <h4 className="mb-5 text-center font-serif">Archivo de profesores</h4>
          <FileSelector
            identifier="professors"
            onChangeFile={setProfessorsFile}
          />
          <div className="ml-3 mt-2 place-self-start">
            <label>
              {professorsFile
                ? `${professorsFile.name}`
                : "No se ha seleccionado ningún archivo"}
            </label>
          </div>

          <button
            type="button"
            disabled={!professorsFile}
            className={`mt-4 w-fit rounded-lg bg-sky-600 px-5 py-2.5 text-center text-sm font-medium hover:bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-4 focus:ring-sky-300 focus:ring-sky-800 ${
              !professorsFile
                ? "bg-black-300 cursor-not-allowed text-gray-300"
                : "bg-sky-700 text-white"
            }`}
            onClick={handleProfessorsFile}
          >
            Cargar archivo
          </button>
        </div>
        <div className="ml-10 flex flex-col items-start items-center justify-center rounded-md bg-sky-200 p-4 text-left">
          <p className="mb-5 text-center font-serif">Archivo de estudiantes</p>
          <FileSelector identifier="students" onChangeFile={setStudentsFile} />
          <div className="ml-3 mt-2 place-self-start">
            <label>
              {studentsFile
                ? `${studentsFile.name}`
                : "No se ha seleccionado ningún archivo"}
            </label>
          </div>

          <button
            type="button"
            disabled={!studentsFile}
            className={`mt-4 w-fit rounded-lg bg-sky-600 px-5 py-2.5 text-center text-sm font-medium hover:bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-4 focus:ring-sky-300 focus:ring-sky-800 ${
              !studentsFile
                ? "bg-black-300 cursor-not-allowed text-gray-300"
                : "bg-sky-700 text-white"
            }`}
            onClick={handleStudentsFile}
          >
            Cargar archivo
          </button>
        </div>
      </div>
    </main>
  );
}
