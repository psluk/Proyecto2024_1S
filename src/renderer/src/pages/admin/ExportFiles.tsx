import { useState, useEffect } from "react";
import DialogAlert from "../../components/DialogAlert";

export default function ExportFiles(): JSX.Element {
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
      <h3 className="mb-10 text-3xl font-bold uppercase text-sky-700">
        Exportar archivos
      </h3>
      <div className="flex justify-center">
        <div className="mr-3 flex flex-col items-start justify-center rounded-md bg-sky-200 p-4 text-left">
          <h4 className="mb-5 text-center font-serif">Archivo de profesores</h4>

          <button
            type="button"
            className="cursor:pointer mt-4 w-fit rounded-lg bg-sky-600 bg-sky-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-300"
            onClick={handleProfessorsFile}
          >
            Exportar archivo
          </button>
        </div>
        <div className="ml-10 flex flex-col items-start justify-center rounded-md bg-sky-200 p-4 text-left">
          <h4 className="mb-5 text-center font-serif">
            Archivo de estudiantes
          </h4>

          <button
            type="button"
            className="cursor:pointer mt-4 w-fit rounded-lg bg-sky-600 bg-sky-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-300"
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
