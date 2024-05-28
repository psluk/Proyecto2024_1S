import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import ExportFiles from "../src/renderer/src/pages/admin/ExportFiles";
import { MemoryRouter } from "react-router-dom";

// Mock the DialogAlert component
vi.mock("@renderer/components/DialogAlert", () => ({
  __esModule: true,
  default: ({ show, title, message, handleConfirm }: any) => {
    if (!show) return null;
    return (
      <div data-testid="dialog-alert">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={handleConfirm}>OK</button>
      </div>
    );
  },
}));

// Mock the mainController in the global window object
beforeEach(() => {
  window.mainController = {
    exportProfessorsFile: vi.fn(),
    exportStudentsFile: vi.fn(),
  };
});

describe("ExportFiles component", () => {
  it("renders correctly", () => {
    render(
      <MemoryRouter>
        <ExportFiles />
      </MemoryRouter>,
    );

    expect(screen.getByText("Exportar archivos")).toBeInTheDocument();
    expect(screen.getByText("Archivo de profesores")).toBeInTheDocument();
    expect(screen.getByText("Archivo de estudiantes")).toBeInTheDocument();
  });

  it("handles successful professors file export", async () => {
    render(
      <MemoryRouter>
        <ExportFiles />
      </MemoryRouter>,
    );

    const exportButtons = screen.getAllByText("Exportar archivo", {
      selector: "button",
    });
    await userEvent.click(exportButtons[0]); // Click on the first export button

    expect(window.mainController.exportProfessorsFile).toHaveBeenCalled();
    expect(screen.queryByTestId("dialog-alert")).not.toBeInTheDocument();
  });

  it("handles successful students file export", async () => {
    render(
      <MemoryRouter>
        <ExportFiles />
      </MemoryRouter>,
    );

    const exportButtons = screen.getAllByText("Exportar archivo", {
      selector: "button",
    });
    await userEvent.click(exportButtons[1]); // Click on the second export button

    expect(window.mainController.exportStudentsFile).toHaveBeenCalled();
    expect(screen.queryByTestId("dialog-alert")).not.toBeInTheDocument();
  });

  it("shows error dialog on failed professors file export", async () => {
    window.mainController.exportProfessorsFile.mockImplementation(() => {
      throw new Error("Failed to export");
    });

    render(
      <MemoryRouter>
        <ExportFiles />
      </MemoryRouter>,
    );

    const exportButtons = screen.getAllByText("Exportar archivo", {
      selector: "button",
    });
    await userEvent.click(exportButtons[0]); // Click on the first export button

    expect(window.mainController.exportProfessorsFile).toHaveBeenCalled();

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(
      screen.getByText("Error al exportar profesores."),
    ).toBeInTheDocument();
  });

  it("shows error dialog on failed students file export", async () => {
    window.mainController.exportStudentsFile.mockImplementation(() => {
      throw new Error("Failed to export");
    });

    render(
      <MemoryRouter>
        <ExportFiles />
      </MemoryRouter>,
    );

    const exportButtons = screen.getAllByText("Exportar archivo", {
      selector: "button",
    });
    await userEvent.click(exportButtons[1]); // Click on the second export button

    expect(window.mainController.exportStudentsFile).toHaveBeenCalled();
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(
      screen.getByText("Error al exportar estudiantes."),
    ).toBeInTheDocument();
  });
});
