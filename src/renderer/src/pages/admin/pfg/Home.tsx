import { pfgOptions } from "@renderer/constants/PFGOptions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

const PFGHome = () => {
  return (
    <main className="gap-10">
      <div className="flex w-full flex-col items-center gap-10">
        <h1 className="text-3xl font-bold">Menú de tesis</h1>
        <ul className="flex w-full max-w-2xl flex-row flex-wrap">
          {pfgOptions.map((option, index) => (
            <li className="w-1/2 px-2 py-3" key={index}>
              <Link
                to={option.path}
                className={`flex flex-row items-center gap-5 rounded-lg px-6 py-8 text-2xl text-white shadow-md transition ${option.background} ${option.hoverBackground}`}
              >
                <span>
                  <FontAwesomeIcon className="size-8" icon={option.icon} />
                </span>
                {option.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default PFGHome;
