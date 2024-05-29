import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";

type Props = {
  handleConfirm: () => void;
  title: string;
  message: string;
  show: boolean;
  type: "success" | "error";
};

export default function DialogAlert({
  handleConfirm,
  title,
  message,
  show,
  type,
}: Props): JSX.Element {
  const icon = type === "success" ? faCheck : faXmark;
  const colorIcon = type === "success" ? "text-sky-600" : "text-red-600";
  return (
    <div
      className={`absolute left-0 top-0 z-0 h-full w-full items-center justify-center bg-gray-600/40 ${show ? "flex" : "hidden"}`}
      onClick={handleConfirm}
    >
      <div className="relative">
        <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/3 transform rounded-full bg-white p-2">
          <FontAwesomeIcon icon={icon} className={`h-8 w-8 ${colorIcon}`} />
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
          </div>
        </div>
      </div>
    </div>
  );
}
