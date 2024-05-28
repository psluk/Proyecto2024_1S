import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import ManageStudents from "../src/renderer/src/pages/admin/ManageStudents";
import { MemoryRouter } from "react-router-dom";
import Student from "../src/models/Student";

vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => <span>FA Icon</span>,
}));

vi.mock("@renderer/components/DialogConfirm", () => ({
  default: ({ title, message, handleConfirm, handleCancel, show }: any) => {
    if (!show) return null;
    return (
      <div data-testid="dialog-confirm">
        <h1>{title}</h1>
        <p>{message}</p>
        <button onClick={handleConfirm}>Confirmar</button>
        <button onClick={handleCancel}>Cancelar</button>
      </div>
    );
  },
}));

vi.mock("@renderer/components/DialogAlert", () => ({
  default: ({ title, message, show, handleConfirm, type }: any) => {
    if (!show) return null;
    return (
      <div data-testid="dialog-alert">
        <h1>{title}</h1>
        <p>{message}</p>
        <button onClick={handleConfirm}>Aceptar</button>
      </div>
    );
  },
}));

beforeEach(() => {
  window.mainController = {
    getStudents: vi
      .fn()
      .mockReturnValue([
        new Student(
          1,
          "John Doe",
          "123456789",
          "john@example.com",
          "1234",
          true,
        ),
        new Student(
          2,
          "Jane Smith",
          "987654321",
          "jane@example.com",
          "5678",
          false,
        ),
      ]),
    deleteStudent: vi.fn(),
  };
});

describe("ManageStudents component", () => {
  it("renders correctly", () => {
    render(
      <MemoryRouter>
        <ManageStudents />
      </MemoryRouter>,
    );

    expect(screen.getByText("Administrar estudiantes")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Buscar estudiante"),
    ).toBeInTheDocument();
    expect(screen.getByText("Agregar estudiante")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("filters students based on search input", () => {
    render(
      <MemoryRouter>
        <ManageStudents />
      </MemoryRouter>,
    );

    const searchInput = screen.getByPlaceholderText(
      "Buscar estudiante",
    ) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: "Jane" } });

    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("handles delete student correctly", async () => {
    render(
      <MemoryRouter>
        <ManageStudents />
      </MemoryRouter>,
    );

    const deleteButtons = screen.getAllByTitle("Eliminar");
    await userEvent.click(deleteButtons[0]);

    const confirmButton = screen.getAllByText("Confirmar");
    await userEvent.click(confirmButton[0]);

    expect(window.mainController.deleteStudent).toHaveBeenCalledWith(1);
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.queryByTestId("dialog-confirm")).not.toBeInTheDocument();
  });

  it("handles add student navigation correctly", async () => {
    const navigateMock = vi.fn();
    render(
      <MemoryRouter>
        <ManageStudents />
      </MemoryRouter>,
    );

    const addButton = screen.getByText("Agregar estudiante");
    await userEvent.click(addButton);
  });
});
