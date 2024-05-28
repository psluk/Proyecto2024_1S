import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import UploadFiles from "../src/renderer/src/pages/admin/UploadFiles";

describe("UploadFiles component", () => {
  it("renders correctly", () => {
    render(<UploadFiles />);

    expect(screen.getByText("Módulo de carga de datos")).toBeInTheDocument();
    expect(screen.getByText("Archivo de profesores")).toBeInTheDocument();
    expect(screen.getByText("Archivo de estudiantes")).toBeInTheDocument();
  });

  it("enables and disables the upload buttons based on file selection", () => {
    render(<UploadFiles />);

    const professorsButton = document.getElementById(
      "upload-professors-button",
    ) as HTMLButtonElement;
    const studentsButton = document.getElementById(
      "upload-students-button",
    ) as HTMLButtonElement;

    expect(professorsButton).toBeDisabled();
    expect(studentsButton).toBeDisabled();

    const professorsInput = document.querySelector(
      'input[type="file"][id="dropzone-file-professors"]',
    ) as HTMLInputElement;
    const studentsInput = document.querySelector(
      'input[type="file"][id="dropzone-file-students"]',
    ) as HTMLInputElement;

    fireEvent.change(professorsInput, {
      target: {
        files: [
          new File(["dummy content"], "professors.xlxs", {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
        ],
      },
    });
    fireEvent.change(studentsInput, {
      target: {
        files: [
          new File(["dummy content"], "students.xlxs", {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
        ],
      },
    });

    expect(professorsButton).not.toBeDisabled();
    expect(studentsButton).not.toBeDisabled();
  });

  it("handles file upload for professors correctly", async () => {
    render(<UploadFiles />);

    const professorsInput = document.querySelector(
      'input[type="file"][id="dropzone-file-professors"]',
    ) as HTMLInputElement;
    fireEvent.change(professorsInput, {
      target: {
        files: [
          new File(["dummy content"], "professors.csv", {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
        ],
      },
    });

    const professorsButton = document.getElementById(
      "upload-professors-button",
    ) as HTMLButtonElement;
    await userEvent.click(professorsButton);
  });

  it("handles file upload for students correctly", async () => {
    render(<UploadFiles />);

    const studentsInput = document.querySelector(
      'input[type="file"][id="dropzone-file-students"]',
    ) as HTMLInputElement;
    fireEvent.change(studentsInput, {
      target: {
        files: [
          new File(["dummy content"], "students.xlsx", {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
        ],
      },
    });

    const studentsButton = document.getElementById(
      "upload-students-button",
    ) as HTMLButtonElement;
    await userEvent.click(studentsButton);
  });
});
