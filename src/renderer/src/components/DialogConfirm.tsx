import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

type Props = {
  handleConfirm: () => void;
  handleCancel: () => void;
  title: string;
  message: string;
  show: boolean;
};

export default function DialogConfirm({
  handleConfirm,
  handleCancel,
  title,
  message,
  show,
}: Props): JSX.Element {
  return (
    <div
      className={`absolute top-0 left-0 z-0 h-full w-full items-center justify-center bg-gray-600/40 ${show ? "flex" : "hidden"}`}
      onClick={handleCancel}
    >
      <div className="relative">
        <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/3 transform rounded-full bg-white p-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="h-8 w-8 " />
        </div>

        <div className="z-10 flex flex-col items-center justify-center gap-6 rounded-md bg-white p-16 shadow-sm">
          <div className="">
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>
          <div className="">
            <p>{message}</p>
          </div>
          <div className="flex gap-4">
            <button
              className="h-8 rounded-md bg-sky-600 px-4 font-semibold text-white shadow-sm"
              onClick={handleConfirm}
            >
              Confirmar
            </button>
            <button
              className="h-8 rounded-md bg-red-600 px-4 font-semibold text-white shadow-sm"
              onClick={handleCancel}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
