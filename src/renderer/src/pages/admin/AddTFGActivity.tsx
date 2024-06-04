import { useLocation, useNavigate } from "react-router-dom";
import DialogAlert from "@renderer/components/DialogAlert";
import { useState, useEffect } from "react";
import Course from "../../../../models/Course";

export default function AddTFGActivity() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, name } = location.state;
  const [message, setMessage] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [typeDialog, setTypeDialog] = useState<"success" | "error">("success");
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const loadedCourses = window.mainController
      .getCourses()
      .filter((course) => course.code === "CM5300" || course.code === "CM5331")
      .map((course) => Course.reinstantiate(course) as Course);
    setCourses(loadedCourses);
  }, []);

  useEffect(() => {
    if (message !== "") {
      setShowDialog(true); // Only show dialog if message is not empty
    }
  }, [message]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const courseJson = (form.elements.namedItem("course") as HTMLSelectElement)
      .value;

    const selectedCourse = JSON.parse(courseJson);

    const students = parseInt(
      (form.elements.namedItem("students") as HTMLInputElement).value,
    );

    const loadType = parseInt(
      (form.elements.namedItem("loadType") as HTMLSelectElement).value,
    );

    console.log(
      "Data: ",
      selectedCourse.id,
      selectedCourse.name,
      selectedCourse.hours,
      selectedCourse.type,
      students,
      loadType,
      id,
    );

    try {
      window.mainController.addTFGActivityToWorkload(
        selectedCourse.id,
        selectedCourse.name,
        selectedCourse.hours,
        selectedCourse.type,
        students,
        loadType,
        id,
      );
      setTitle("Éxito");
      setTypeDialog("success");
      setMessage("Labor TFG agregada a la carga con éxito");
    } catch {
      setTitle("Error");
      setTypeDialog("error");
      setMessage("Error al agregar labor TFG a la carga");
    }
  };

  return (
    <main className="gap-10">
      <h1 className="text-3xl font-bold">
        Agregar labor TFG al profesor: {name}
      </h1>
      <form
        className="flex w-full max-w-2xl flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <div className="flex w-full flex-col gap-3">
          <label
            htmlFor="course"
            className="text-white-900 block text-sm font-medium leading-6"
          >
            Labor
          </label>
          <select
            id="course"
            className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600"
            required
          >
            {courses.map((course) => (
              <option key={course.getId()} value={JSON.stringify(course)}>
                {course.getCode()}: {course.getName()}
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-full flex-col gap-3">
          <label
            htmlFor="students"
            className="text-white-900 block text-sm font-medium leading-6"
          >
            Cantidad de estudiantes
          </label>
          <input
            type="number"
            id="students"
            className="flex rounded-md border-0 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600"
            required
          />
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
