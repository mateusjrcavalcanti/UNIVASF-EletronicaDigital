import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HelpDialog } from "./HelpDialog";

function renderDialog(onClose = vi.fn()) {
  const utils = render(<HelpDialog onClose={onClose} />);
  return { ...utils, onClose };
}

describe("HelpDialog (a11y)", () => {
  it("renderiza com role dialog e nome acessível", () => {
    renderDialog();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName("Como funciona a conversão");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleDescription();
  });

  it("move o foco para dentro do diálogo ao abrir", () => {
    renderDialog();
    const closeButton = screen.getByRole("button", { name: "Fechar diálogo" });
    expect(closeButton).toHaveFocus();
  });

  it("fecha ao pressionar Escape", async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("trava o foco: Tab a partir do último elemento volta ao primeiro", () => {
    renderDialog();
    const dialog = screen.getByRole("dialog");
    const focusables = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
      )
    );
    expect(focusables.length).toBeGreaterThan(0);

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    last.focus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(first).toHaveFocus();

    first.focus();
    fireEvent.keyDown(first, { key: "Tab", shiftKey: true });
    expect(last).toHaveFocus();
  });

  it("restaura o foco para o elemento anterior ao fechar", () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Abrir ajuda";
    document.body.appendChild(trigger);
    trigger.focus();

    const { unmount } = render(<HelpDialog onClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Fechar diálogo" })).toHaveFocus();

    unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
