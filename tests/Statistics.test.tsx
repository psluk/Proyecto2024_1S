import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Statistics from "../src/renderer/src/pages/admin/Statistics";
import { MemoryRouter } from "react-router-dom";

// Mock the mainController in the global window object
beforeEach(() => {
  window.mainController = {
    gatherStatistics: vi.fn().mockReturnValue([
      {
        title: "Test Title 1",
        values: [
          { label: "Label 1", value: 10 },
          { label: "Label 2", value: 20 },
        ],
      },
      {
        title: "Test Title 2",
        values: [
          { label: "Label 3", value: 30 },
          { label: "Label 4", value: 40 },
        ],
      },
    ]),
  };
});

describe("Statistics component", () => {
  it("renders correctly", () => {
    render(
      <MemoryRouter>
        <Statistics />
      </MemoryRouter>,
    );

    expect(screen.getByText("Estadísticas")).toBeInTheDocument();
    expect(screen.getByText("Test Title 1")).toBeInTheDocument();
    expect(screen.getByText("Test Title 2")).toBeInTheDocument();
  });

  it("calls gatherStatistics on mount", () => {
    render(
      <MemoryRouter>
        <Statistics />
      </MemoryRouter>,
    );

    expect(window.mainController.gatherStatistics).toHaveBeenCalled();
  });

  it("renders the correct number of Pie charts", () => {
    render(
      <MemoryRouter>
        <Statistics />
      </MemoryRouter>,
    );

    const pieCharts = screen.getAllByRole("img", { hidden: true }); // Pie charts use canvas elements
    expect(pieCharts).toHaveLength(2);
  });

  it("renders the correct titles for the Pie charts", () => {
    render(
      <MemoryRouter>
        <Statistics />
      </MemoryRouter>,
    );

    expect(screen.getByText("Test Title 1")).toBeInTheDocument();
    expect(screen.getByText("Test Title 2")).toBeInTheDocument();
  });
});
