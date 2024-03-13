import { ShowLogin } from "@renderer/global/ShowLogin";
import { useNavigate } from "react-router-dom";

export default function LogoutButton(): JSX.Element {
  const navigate = useNavigate();

  if (ShowLogin) {
    return (
      <button
        className="text-m flex w-auto justify-center rounded-md bg-blue-600 px-3 py-1.5 font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        type="button"
        onClick={() => {
          navigate("/");
        }}
      >
        Cerrar sesión
      </button>
    );
  } else {
    return <></>;
  }
}
