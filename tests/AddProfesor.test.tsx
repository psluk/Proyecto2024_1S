import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AddProfessor from "../src/renderer/src/pages/admin/AddProfessor";
import { MemoryRouter } from "react-router-dom";

describe("AddProfessor component", () => {
  it("renders correctly", () => {
    render(
      <MemoryRouter>
        <AddProfessor />
      </MemoryRouter>,
    );

    expect(screen.getByText("Agregar profesor")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Tipo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Agregar" })).toBeInTheDocument();
  });
});
