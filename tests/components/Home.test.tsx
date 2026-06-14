import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("home page", () => {
  it("shows the Marian identity and both main actions", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: "Manto de Maria" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Um espaço de carinho, oração e mensagens anônimas para o nosso círculo.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Nossa Senhora em oração" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Enviar mensagem/i }),
    ).toHaveAttribute("href", "/enviar");
    expect(
      screen.getByRole("link", { name: /Ler minhas mensagens/i }),
    ).toHaveAttribute("href", "/mensagens");
  });
});
