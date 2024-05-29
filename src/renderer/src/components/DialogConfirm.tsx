import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

type Props = {
  handleConfirm: () => void;
  handleCancel: () => void;
  title: string;
  message: string;
  show: boolean;
  confirmText?: string;
  cancelText?: string;
  setShow?: (show: boolean) => void;
};

export default function DialogConfirm({
  handleConfirm,
  handleCancel,
  title,
  message,
  show,
  setShow,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}: Props): JSX.Element {
  return (
    <div
      className={`absolute left-0 top-0 z-0 h-full w-full items-center justify-center bg-gray-600/40 ${show ? "flex" : "hidden"}`}
      onClick={setShow ? (): void => setShow(false) : handleCancel}
    >
      <div className="relative max-w-2xl">
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
              className="z-20 h-8 rounded-md bg-sky-600 px-4 font-semibold text-white shadow-sm"
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
            <button
              className="z-20 h-8 rounded-md bg-red-600 px-4 font-semibold text-white shadow-sm"
              onClick={handleCancel}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
