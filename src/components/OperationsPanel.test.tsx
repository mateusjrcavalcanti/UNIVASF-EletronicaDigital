import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { OperationsPanel } from "./OperationsPanel";

describe("OperationsPanel", () => {
  it("renderiza operandos, seletor de operação e base de saída", () => {
    render(<OperationsPanel />);
    expect(screen.getByLabelText("Operando A")).toBeInTheDocument();
    expect(screen.getByLabelText("Operando B")).toBeInTheDocument();
    expect(screen.getByLabelText("Operação")).toBeInTheDocument();
    expect(screen.getByLabelText("Base de saída")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Calcular" })).toBeInTheDocument();
  });

  it("não mostra campo de amount de shift por padrão", () => {
    render(<OperationsPanel />);
    expect(screen.queryByLabelText("Quantidade de shifts")).not.toBeInTheDocument();
  });

  it("mostra campo de amount ao selecionar Shift Left", async () => {
    const user = userEvent.setup();
    render(<OperationsPanel />);
    await user.selectOptions(screen.getByLabelText("Operação"), "shiftLeft");
    expect(screen.getByLabelText("Quantidade de shifts")).toBeInTheDocument();
  });

  it("calcula adição e mostra resultado", async () => {
    const user = userEvent.setup();
    render(<OperationsPanel />);

    await user.type(screen.getByLabelText("Operando A"), "1010");
    await user.selectOptions(screen.getByLabelText("Base do operando A"), "2");
    await user.type(screen.getByLabelText("Operando B"), "10");
    await user.selectOptions(screen.getByLabelText("Base do operando B"), "10");
    await user.selectOptions(screen.getByLabelText("Base de saída"), "10");
    await user.click(screen.getByRole("button", { name: "Calcular" }));

    const result = screen.getByTestId("operation-result");
    expect(result).toHaveTextContent("20");
    expect(result).toHaveTextContent("Decimal (base 10)");
  });

  it("calcula XOR entre operandos de bases diferentes", async () => {
    const user = userEvent.setup();
    render(<OperationsPanel />);

    await user.type(screen.getByLabelText("Operando A"), "1010"); // 10
    await user.selectOptions(screen.getByLabelText("Base do operando A"), "2");
    await user.type(screen.getByLabelText("Operando B"), "7"); // 7
    await user.selectOptions(screen.getByLabelText("Base do operando B"), "10");
    await user.selectOptions(screen.getByLabelText("Operação"), "XOR");
    await user.selectOptions(screen.getByLabelText("Base de saída"), "10");
    await user.click(screen.getByRole("button", { name: "Calcular" }));

    expect(screen.getByTestId("operation-result")).toHaveTextContent("13");
  });

  it("calcula shift left e expande o passo a passo", async () => {
    const user = userEvent.setup();
    render(<OperationsPanel />);

    await user.type(screen.getByLabelText("Operando A"), "1");
    await user.selectOptions(screen.getByLabelText("Base do operando A"), "2");
    await user.selectOptions(screen.getByLabelText("Operação"), "shiftLeft");
    await user.clear(screen.getByLabelText("Quantidade de shifts"));
    await user.type(screen.getByLabelText("Quantidade de shifts"), "3");
    await user.selectOptions(screen.getByLabelText("Base de saída"), "2");
    await user.click(screen.getByRole("button", { name: "Calcular" }));

    expect(screen.getByTestId("operation-result")).toHaveTextContent("1000");

    // Passo a passo expandível
    const toggle = screen.getByRole("button", { name: "Passo a passo da operação" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const steps = screen.getByTestId("operation-steps");
    expect(steps).toHaveTextContent("Shift left");
  });

  it("desabilita o botão Calcular sem operandos", () => {
    render(<OperationsPanel />);
    expect(screen.getByRole("button", { name: "Calcular" })).toBeDisabled();
  });
});
