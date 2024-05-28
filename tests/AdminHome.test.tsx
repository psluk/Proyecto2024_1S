import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import AdminHome from "../src/renderer/src/pages/admin/Home";

describe("AdminHome component", () => {
  it("Se renderiza bien y carga los botones del menú", () => {
    render(
      <MemoryRouter>
        <AdminHome />
      </MemoryRouter>,
    );

    // Verificar que el logo se renderiza
    const logo = screen.getByAltText("Logo");
    expect(logo).toBeInTheDocument();

    // Verificar que el título se renderiza
    const title = screen.getByText(
      "Gestor de Asignaciones de Defensas de Tesis",
    );
    expect(title).toBeInTheDocument();

    // Verificar que las opciones del administrador se renderizan

    const option1 = screen.getByText("Estadísticas");
    expect(option1).toBeInTheDocument();

    const option2 = screen.getByText("Profesores");
    expect(option2).toBeInTheDocument();

    const option3 = screen.getByText("Tesis");
    expect(option3).toBeInTheDocument();

    const option4 = screen.getByText("Cargar datos");
    expect(option4).toBeInTheDocument();

    const option5 = screen.getByText("Exportar datos");
    expect(option5).toBeInTheDocument();
  });
});
