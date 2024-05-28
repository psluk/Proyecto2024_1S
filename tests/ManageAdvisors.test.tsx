import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import ManageAdvisors from "../src/renderer/src/pages/admin/pfg/ManageAdvisors";
import { MemoryRouter } from "react-router-dom";

// Mock the DialogConfirm and DialogAlert components
vi.mock("@renderer/components/DialogConfirm", () => ({
  __esModule: true,
  default: ({ show, title, message, handleConfirm, handleCancel }: any) => {
    if (!show) return null;
    return (
      <div data-testid="dialog-confirm">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={handleConfirm}>OK</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    );
  },
}));

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
    getStudentsProfessors: vi.fn().mockReturnValue([
      {
        student: { id: 1, name: "John Doe" },
        professors: [
          { id: 1, name: "Prof. Smith", isAdvisor: true },
          { id: 2, name: "Prof. Johnson", isAdvisor: false },
        ],
      },
      {
        student: { id: 2, name: "Jane Doe" },
        professors: [],
      },
    ]),
    generateRandomProfessorsAssigments: vi.fn(),
    deleteStudentProfessor: vi.fn(),
    deleteProfessorsAssigments: vi.fn(),
  };
});

describe("ManageAdvisors component", () => {
  it("renders correctly", () => {
    render(
      <MemoryRouter>
        <ManageAdvisors />
      </MemoryRouter>,
    );

    expect(screen.getByText("Administrar tutores")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Buscar estudiante"),
    ).toBeInTheDocument();
    expect(screen.getByText("Generar aleatoriamente")).toBeInTheDocument();
  });

  it("displays the correct number of students", () => {
    render(
      <MemoryRouter>
        <ManageAdvisors />
      </MemoryRouter>,
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("filters students based on search input", async () => {
    render(
      <MemoryRouter>
        <ManageAdvisors />
      </MemoryRouter>,
    );

    const searchInput = screen.getByPlaceholderText("Buscar estudiante");
    await userEvent.type(searchInput, "John");

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jane Doe")).not.toBeInTheDocument();
  });
});
