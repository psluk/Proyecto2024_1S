import FileSelector from "@renderer/components/FileSelector";
import { useState, useEffect } from "react";
import DialogAlert from "@renderer/components/DialogAlert";

export default function UploadFiles(): JSX.Element {
  const [professorsFile, setProfessorsFile] = useState<File | null>(null);
  const [studentsFile, setStudentsFile] = useState<File | null>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [type, setType] = useState<"success" | "error">("success");

  const handleProfessorsFile = async () => {
    if (!professorsFile) {
      return;
    }

    try {
      const result = await window.mainController.importProfessors(
        await professorsFile.arrayBuffer(),
      );
      let newMessage = "";

      if (result.successfulInserts.length > 0) {
        setTitle("Importación exitosa");
        newMessage = `Se importaron ${result.successfulInserts.length} profesores correctamente.\n`;
        setType("success");
      }

      if (result.errors.length > 0) {
        setTitle("Importación con errores");
        newMessage = `No se pudieron importar ${result.errors.length} profesores.\n`;
        setType("error");
      }

      if (newMessage === "") {
        setTitle("Importación fallida");
        newMessage = "No se encontraron profesores para importar.";
        setType("error");
      }

      setMessage(newMessage.trim());
      setShowDialog(true);
    } catch (error) {
      setTitle("Error");
      setMessage("Error al importar profesores.");
      setType("error");
      setShowDialog(true);
    }
  };

  const handleStudentsFile = async () => {
    if (!studentsFile) {
      return;
    }

    try {
      const result = await window.mainController.importStudents(
        await studentsFile.arrayBuffer(),
      );
      let newMessage = "";

      if (result.successfulInserts.length > 0) {
        setTitle("Importación exitosa");
        newMessage = `Se importaron ${result.successfulInserts.length} estudiantes correctamente.\n`;
        setType("success");
      }

      if (result.errors.length > 0) {
        setTitle("Importación con errores");
        newMessage = `No se pudieron importar ${result.errors.length} estudiantes.\n`;
        setType("error");
      }

      if (newMessage === "") {
        setTitle("Importación fallida");
        newMessage = "No se encontraron estudiantes para importar.";
        setType("error");
      }

      setMessage(newMessage.trim());
      setShowDialog(true);
    } catch (error) {
      setTitle("Error");
      setMessage("Error al importar estudiantes.");
      setType("error");
      setShowDialog(true);
    }
  };


  useEffect(() => {
    if (message !== "") {
      setShowDialog(true);
    }
  }, [message]);

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
      <DialogAlert
        title={title}
        message={message}
        show={showDialog}
        handleConfirm={() => {
          setShowDialog(!showDialog);
        }}
        type={type}
      />
    </main>
  );
}
