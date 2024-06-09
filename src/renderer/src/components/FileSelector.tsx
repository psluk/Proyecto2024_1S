import {
  ChangeEvent,
  Dispatch,
  DragEvent,
  SetStateAction,
  useState,
} from "react";
import DialogAlert from "./DialogAlert";
interface FileSelectorProps {
  identifier: string;
  onFileChange: Dispatch<SetStateAction<File | null>>;
}

export default function FileSelector({
  identifier,
  onFileChange,
}: FileSelectorProps): JSX.Element {
  const isValidFileType = (file: File): boolean => {
    return (
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel.sheet.macroEnabled.12"
    );
  };

  const [showDialog, setShowDialog] = useState<boolean>(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (files !== null && files.length > 0) {
      const file = files[0];
      if (file && isValidFileType(file)) {
        onFileChange(file);
      }
    } else {
      setShowDialog(true);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && isValidFileType(file)) {
      onFileChange(file);
    } else {
      setShowDialog(true);
    }
  };

  return (
    <div
      className="w-full items-center justify-center"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <label
        htmlFor={`dropzone-file-${identifier}`}
        className="light:hover:bg-bray-800 light:border-gray-600 light:bg-gray-700 light:hover:border-gray-500 light:hover:bg-gray-600 m-2 flex h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
      >
        <div className="flex flex-col items-center justify-center pb-6 pt-5">
          <svg
            className="light:text-sky-600 mb-4 h-8 w-8 text-sky-600"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p className="light:text-gray-400 mb-2 px-4 text-sm text-gray-500">
            <span className="font-semibold text-sky-600">
              Haga click para cargar
            </span>{" "}
            o arrastre y suelte el archivo
          </p>
          <p className="light:text-gray-400 text-xs text-gray-500">
            Archivos: .xlsx
          </p>
        </div>
        <input
          id={`dropzone-file-${identifier}`}
          type="file"
          className="absolute h-0 w-0 overflow-hidden"
          onChange={handleFileChange}
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel.sheet.macroEnabled.12"
        />
      </label>
      <DialogAlert
        title="Archivo inválido"
        message="Por favor seleccione un archivo .xlsx o .xlsm válido."
        show={showDialog}
        handleConfirm={() => {
          setShowDialog(!showDialog);
        }}
        type="error"
      />
    </div>
  );
}
