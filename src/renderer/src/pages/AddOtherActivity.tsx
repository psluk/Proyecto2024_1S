import { useLocation, useNavigate } from "react-router-dom";
import DialogAlert from "@renderer/components/DialogAlert";
import React, { useState, useEffect } from "react";
import { OtherActivity } from "src/database/ProfessorDao";

export default function AddOtherActivity(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, name, pageActivityType } = location.state;
  const [message, setMessage] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [typeDialog, setTypeDialog] = useState<"success" | "error">("success");
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [activities, setActivities] = useState<OtherActivity[]>([]);

  useEffect(() => {
    const loadedActivities = window.mainController
      .getOtherActivities()
      .filter((activity) => activity.activityTypeId === pageActivityType);
    setActivities(loadedActivities);
  }, []);

  useEffect(() => {
    if (message !== "") {
      setShowDialog(true); // Only show dialog if message is not empty
    }
  }, [message]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const activityJson = (
      form.elements.namedItem("activity") as HTMLSelectElement
    ).value;

    const selectedActivity = JSON.parse(activityJson);

    const loadType = parseInt(
      (form.elements.namedItem("loadType") as HTMLSelectElement).value,
    );

    try {
      window.mainController.addOtherActivityToWorkload(
        selectedActivity.name,
        selectedActivity.activityTypeId,
        selectedActivity.load,
        loadType,
        id,
      );
      setTitle("Éxito");
      setTypeDialog("success");
      setMessage("Curso agregado a la carga con éxito");
    } catch {
      setTitle("Error");
      setTypeDialog("error");
      setMessage("Error al agregar curso a la carga");
    }
  };

  return (
    <main className="gap-10">
      <h1 className="text-3xl font-bold">
        Agregar actividad al profesor: {name}
      </h1>
      <form
        className="flex w-full max-w-2xl flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <div className="flex w-full flex-col gap-3">
          <label
            htmlFor="activity"
            className="text-white-900 block text-sm font-medium leading-6"
          >
            Actividad
          </label>
          <select
            id="activity"
            className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600"
            required
          >
            {React.Children.toArray(
              activities.map((activity) => (
                <option value={JSON.stringify(activity)}>
                  {activity.name} - {activity.load} horas
                </option>
              )),
            )}
          </select>
        </div>
        <div className="flex w-full flex-col gap-3">
          <label
            htmlFor="loadType"
            className="text-white-900 block text-sm font-medium leading-6"
          >
            Tipo de carga
          </label>
          <select
            id="loadType"
            className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600"
            required
          >
            <option value={1}>Normal</option>
            <option value={2}>Ampliación</option>
            <option value={3}>Doble ampliación</option>
            <option value={4}>Recargo</option>
            <option value={5}>Ad honorem</option>
          </select>
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-md bg-blue-600 px-3 py-1.5 font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Agregar
        </button>
      </form>
      <DialogAlert
        show={showDialog}
        type={typeDialog}
        title={title}
        message={message}
        handleConfirm={() => {
          setShowDialog(false);
          typeDialog === "success" && navigate(-1);
        }}
      />
    </main>
  );
}
