import { ElectronAPI } from "@electron-toolkit/preload";
import MainController from "src/controllers/MainController";

declare global {
  interface Window {
    electron: ElectronAPI;
    mainController: MainController;
  }
}
