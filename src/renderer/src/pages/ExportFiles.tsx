import React, { useState, useEffect } from "react";
import DialogAlert from "@renderer/components/DialogAlert";

export default function ExportFiles(): React.ReactElement {
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [type, setType] = useState<"success" | "error">("success");

  const handleProfessorsFile = async (): Promise<void> => {
    try {
      await window.mainController.exportProfessorsFile();
    } catch (error) {
      setTitle("Error");
      setMessage("Error al exportar profesores.");
      setType("error");
      setShowDialog(true);
    }
  };

  const handleStudentsFile = async (): Promise<void> => {
    try {
      await window.mainController.exportStudentsFile();
    } catch (error) {
      setTitle("Error");
      setMessage("Error al exportar estudiantes.");
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
        Exportar archivos
      </h1>
      <div className="flex flex-col justify-center gap-6 md:flex-row">
        <div className="flex flex-col items-center justify-center rounded-md bg-sky-200 p-4 text-left shadow-md">
          <h2 className="text-center text-xl font-bold">
            Archivo de profesores
          </h2>

          <button
            type="button"
            className="cursor:pointer mt-4 w-fit rounded-lg bg-sky-600 px-5 py-2 text-center font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-300"
            onClick={handleProfessorsFile}
          >
            Exportar archivo
          </button>
        </div>
        <div className="flex flex-col items-center justify-center rounded-md bg-sky-200 p-4 text-left shadow-md">
          <h2 className="text-center text-xl font-bold">
            Archivo de estudiantes
          </h2>

          <button
            type="button"
            className="cursor:pointer mt-4 w-fit rounded-lg bg-sky-600 px-5 py-2 text-center font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-300"
            onClick={handleStudentsFile}
          >
            Exportar archivo
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
