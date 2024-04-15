import FileSelector from "@renderer/components/FileSelector";
import { useState } from "react";

export default function UploadFiles(): JSX.Element {
  const [professorsFile, setProfessorsFile] = useState<File | null>(null);
  const [studentsFile, setStudentsFile] = useState<File | null>(null);

  const handleProfessorsFile = async () => {
    if (!professorsFile) {
      return;
    }
    
    window.mainController.importProfessors(await professorsFile.arrayBuffer()).then((result) => {
      let message = "";

      if (result.successfulInserts.length > 0) {
        message += `Se importaron ${result.successfulInserts.length} profesores correctamente.\n`;
      }

      if (result.errors.length > 0) {
        message += `No se pudieron importar ${result.errors.length} profesores.\n`;
      }

      if (message === "") {
        message = "No se encontraron profesores para importar.";
      }

      alert(message.trim());
    });
  };

  const handleStudentsFile = async () => {
    if (!studentsFile) {
      return;
    }

    // window.mainController.importStudents(await studentsFile.arrayBuffer()).then((result) => {
    //   let message = "";

    //   if (result.successfulInserts.length > 0) {
    //     message += `Se importaron ${result.successfulInserts.length} estudiantes correctamente.\n`;
    //   }

    //   if (result.errors.length > 0) {
    //     message += `No se pudieron importar ${result.errors.length} estudiantes.\n`;
    //   }

    //   if (message === "") {
    //     message = "No se encontraron estudiantes para importar.";
    //   }

    //   alert(message.trim());
    // });
  };

  return (
    <main className="flex flex-col items-center gap-10">
      <h3 className="mb-10 text-3xl font-bold uppercase text-sky-700">
        Módulo de carga de datos
      </h3>
      <div className="flex justify-center">
        <div className="mr-3 flex flex-col items-start justify-center rounded-md bg-sky-200 p-4 text-left">
          <h4 className="mb-5 text-center font-serif">Archivo de profesores</h4>
          <FileSelector
            identifier="professors"
            onFileChange={setProfessorsFile}
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
            className={`mt-4 w-fit rounded-lg bg-sky-600 px-5 py-2.5 text-center text-sm font-medium hover:bg-sky-700  focus:outline-none focus:ring-4 focus:ring-sky-300  ${
              !professorsFile
                ? "cursor-not-allowed bg-black text-gray-300"
                : "bg-sky-700 text-white"
            }`}
            onClick={handleProfessorsFile}
          >
            Cargar archivo
          </button>
        </div>
        <div className="ml-10 flex flex-col items-start  justify-center rounded-md bg-sky-200 p-4 text-left">
          <p className="mb-5 text-center font-serif">Archivo de estudiantes</p>
          <FileSelector identifier="students" onFileChange={setStudentsFile} />
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
            className={`mt-4 w-fit rounded-lg bg-sky-600 px-5 py-2.5 text-center text-sm font-medium hover:bg-sky-700  focus:outline-none focus:ring-4 focus:ring-sky-300 ${
              !studentsFile
                ? "cursor-not-allowed bg-black text-gray-300"
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
