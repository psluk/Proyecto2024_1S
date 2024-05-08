import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

type Props = {
  handleConfirm: () => void;
  handleCancel: () => void;
  show: boolean;
  setFilter: (filter: { filter: string }) => void;
  setAmount: (amount: number) => void;
  professorAmount: number;
  studentAmount: number;
  selectedAmount: number;
};

export default function RandomGroupsForm({
  handleConfirm,
  handleCancel,
  setFilter,
  setAmount,
  show,
  professorAmount,
  studentAmount,
  selectedAmount,
}: Props): JSX.Element {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleConfirm();
  };

  return (
    <div
      className={`absolute left-0 top-0 z-0 h-full w-full items-center justify-center bg-gray-600/40 ${show ? "flex" : "hidden"}`}
    >
      <div className="relative max-w-2xl">
        <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/3 transform rounded-full bg-white p-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="h-8 w-8 " />
        </div>

        <div className="z-10 flex flex-col items-center justify-center gap-6 rounded-md bg-white p-16 shadow-sm">
          <div className="">
            <h2 className="text-2xl font-bold">{"Generación aleatoria"}</h2>
          </div>
          <div className="space-y-1">
            <p>
              Actualmente hay{" "}
              <span className="font-bold underline">{studentAmount}</span>{" "}
              estudiantes
            </p>
            <p>
              Actualmente hay{" "}
              <span className="font-bold underline">{professorAmount}</span>{" "}
              profesores
            </p>
            <p>Seleccione la cantidad de profesores por grupo:</p>
          </div>
          <form
            className="flex w-full flex-col items-center justify-center gap-6"
            onSubmit={handleSubmit}
          >
            <div className="flex w-full items-center justify-center gap-6">
              <div className="space-x-2">
                <label htmlFor="amount" className="font-semibold">
                  Cantidad:
                </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  minLength={3}
                  min={3}
                  max={professorAmount}
                  value={selectedAmount}
                  className="max-w-16 rounded-md border border-gray-300"
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                />
              </div>
            </div>
            <p>
              Con la cantidad seleccionada se crearan{" "}
              <span className="font-bold underline">
                {Math.floor(
                  selectedAmount > 0 ? professorAmount / selectedAmount : 0,
                )}
              </span>{" "}
              grupos
            </p>
            <div className="flex gap-2">
              <button
                className="z-20 h-8 rounded-md bg-sky-600 px-4 font-semibold text-white shadow-sm"
                type="submit"
              >
                Generar
              </button>
              <button
                className="z-20 h-8 rounded-md bg-red-600 px-4 font-semibold text-white shadow-sm"
                onClick={handleCancel}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
