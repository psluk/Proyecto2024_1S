import { useEffect, useState } from "react";
import Student from "../../../../../models/Student";
//import DebouncedInput from "@renderer/components/DebouncedInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const ManageStudents: React.FC = () => {
  //const [search, setSearch] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  //const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //  setSearch(e.target.value);
  //};

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const addStudent = () => {
    // Lógica para agregar un estudiante.
  };

  const editStudent = () => {
    // Lógica para editar un estudiante.
  };

  const deleteStudent = () => {
    // Lógica para eliminar un estudiante.
  };

  return (
    <div className="container mx-auto rounded-md bg-gray-100 p-6 shadow-md">
      <h1 className="mb-10 text-center text-3xl font-bold">
        Gestión de estudiantes
      </h1>
      <div className="flex w-full max-w-sm items-center rounded-md border border-gray-300 bg-white">
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="ml-4 text-gray-400"
        />
        <input
          type="text"
          placeholder="Buscar estudiante"
          className="input flex-1 rounded-md border-none pl-4 focus:outline-none focus:ring-0"
        />
      </div>

      <div className="input-group">
        <label className="mb-3 mt-10 block text-xl font-medium">Nombre</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={handleNameChange}
          className="input w-full flex-1 rounded-md border-gray-300 pl-4 focus:outline-none focus:ring-0"
        />
      </div>
      <div className="input-group">
        <label className="mb-3 mt-3 block text-xl font-medium">Teléfono</label>
        <input
          type="text"
          id="phone"
          value={phone}
          onChange={handlePhoneChange}
          className="input w-full flex-1 rounded-md border-gray-300 pl-4 focus:outline-none focus:ring-0"
        />
      </div>
      <div className="input-group">
        <label className="mb-3 mt-3 block text-xl font-medium">Correo</label>
        <input
          type="text"
          id="email"
          value={email}
          onChange={handleEmailChange}
          className="input w-full flex-1 rounded-md border-gray-300 pl-4 focus:outline-none focus:ring-0"
        />
      </div>
      <div className="mt-7 flex justify-between">
        <button
          onClick={addStudent}
          className="w-1/4 rounded-md bg-blue-800 px-4 font-semibold text-white shadow-sm"
        >
          Agregar
        </button>
        <button
          onClick={editStudent}
          className="w-1/4 rounded-md bg-lime-700 px-4 font-semibold text-white shadow-sm"
        >
          Editar
        </button>
        <button
          onClick={deleteStudent}
          className="w-1/4 rounded-md bg-red-900 px-4 font-semibold text-white shadow-sm"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default ManageStudents;
