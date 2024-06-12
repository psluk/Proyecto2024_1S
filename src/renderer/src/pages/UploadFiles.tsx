import FileSelector from "@renderer/components/FileSelector";
import React, { useState, useEffect } from "react";
import DialogAlert from "@renderer/components/DialogAlert";

export default function UploadFiles(): React.ReactElement {
  const [professorsFile, setProfessorsFile] = useState<File | null>(null);
  const [studentsFile, setStudentsFile] = useState<File | null>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [type, setType] = useState<"success" | "error">("success");

  const handleProfessorsFile = async (): Promise<void> => {
    if (!professorsFile) {
      return;
    }

    try {
      const result = await window.mainController.importProfessors(
        professorsFile.name,
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

  const handleStudentsFile = async (): Promise<void> => {
    if (!studentsFile) {
      return;
    }

    try {
      const result = window.mainController.importStudents(
        studentsFile.name,
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
      <h1 className="mb-5 text-4xl font-bold text-sky-700">
        Módulo de carga de datos
      </h1>
      <div className="flex flex-col justify-center gap-10 lg:flex-row">
        <div className="mr-3 flex flex-col items-center justify-center rounded-md bg-sky-200 p-4 shadow-md">
          <h2 className="mb-5 text-center text-xl font-bold">
            Archivo de profesores
          </h2>
          <FileSelector
            identifier="professors"
            onFileChange={setProfessorsFile}
          />
          <div className="ml-3 mt-2 place-self-start">
            <label className="line-clamp-1">
              {professorsFile
                ? `${professorsFile.name}`
                : "No se ha seleccionado ningún archivo"}
            </label>
          </div>

          <button
            type="button"
            disabled={!professorsFile}
            className={`mt-4 w-fit rounded-lg px-5 py-2.5 text-center text-sm font-medium transition focus:outline-none ${
              !professorsFile
                ? "cursor-not-allowed bg-gray-500 text-gray-300"
                : "bg-sky-700 text-white hover:bg-sky-700 focus:ring-4 focus:ring-sky-300"
            }`}
            onClick={handleProfessorsFile}
          >
            Cargar archivo
          </button>
        </div>
        <div className="flex flex-col items-center justify-center rounded-md bg-sky-200 p-4 shadow-md">
          <h2 className="mb-5 text-center text-xl font-bold">
            Archivo de estudiantes
          </h2>
          <FileSelector identifier="students" onFileChange={setStudentsFile} />
          <div className="ml-3 mt-2 place-self-start">
            <label className="line-clamp-1">
              {studentsFile
                ? `${studentsFile.name}`
                : "No se ha seleccionado ningún archivo"}
            </label>
          </div>

          <button
            type="button"
            disabled={!studentsFile}
            className={`mt-4 w-fit rounded-lg px-5 py-2.5 text-center text-sm font-medium transition focus:outline-none ${
              !studentsFile
                ? "cursor-not-allowed bg-gray-500 text-gray-300"
                : "bg-sky-600 text-white hover:bg-sky-700 focus:ring-4 focus:ring-sky-300"
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
