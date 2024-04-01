import MainController from "../../../../controllers/MainController";

export default function UploadFiles(): JSX.Element {
  const handleFile = async (e) => {
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    //MainController.uploadProfessorsFile(data);
    MainController.uploadProfessorsFile(data);
  };

  return (
    <main className="gap-10">
      <p>
        <span className="font-bold">Cargue los archivos de datos:</span>
      </p>{" "}
      <input type="file" onChange={(e) => handleFile(e)} />
    </main>
  );
}
