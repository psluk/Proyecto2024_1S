import { Link } from "react-router-dom";
function Register(): JSX.Element {
  return (
    <div className="items flex w-full flex-col gap-10">
      <h1 className="text-2xl text-white">Registrese</h1>
      <Link to={"/"} className="text-blue-600">Volver al inicio</Link>
    </div>
  );
}

export default Register;
