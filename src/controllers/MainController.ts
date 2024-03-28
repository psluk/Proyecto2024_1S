import { ExcelModel } from '../models/ExcelModel';


class MainController {

  static uploadProfessorsFile(data:ArrayBuffer):boolean{
    ExcelModel.readProfessorsFromSheet(data);
    console.log("Controller funcionando");
    return true;
  }



}

export default MainController;
