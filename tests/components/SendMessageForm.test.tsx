import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SendMessageForm } from "@/components/SendMessageForm";

const participant = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Henrique",
  slug: "henrique",
};

describe("SendMessageForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads participants and validates an empty form", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ participants: [participant] }), {
        status: 200,
      }),
    );
    const user = userEvent.setup();

    render(<SendMessageForm />);

    expect(
      await screen.findByRole("option", { name: "Henrique" }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Enviar anonimamente" }),
    );

    expect(screen.getByText("Escolha uma pessoa.")).toBeInTheDocument();
    expect(screen.getByText("Escreva uma mensagem.")).toBeInTheDocument();
  });

  it("sends only the recipient and message then clears the form", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ participants: [participant] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ message: "Mensagem enviada com carinho!" }),
          { status: 201 },
        ),
      );
    const user = userEvent.setup();

    render(<SendMessageForm />);

    const selector = await screen.findByLabelText(
      "Para quem você quer enviar?",
    );
    const textarea = screen.getByLabelText("Sua mensagem");

    await user.selectOptions(selector, participant.id);
    await user.type(textarea, "Uma mensagem especial");
    await user.click(
      screen.getByRole("button", { name: "Enviar anonimamente" }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith("/api/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          recipientId: participant.id,
          messageText: "Uma mensagem especial",
        }),
      });
    });
    expect(
      await screen.findByText("Mensagem enviada com carinho!"),
    ).toBeInTheDocument();
    expect(selector).toHaveValue("");
    expect(textarea).toHaveValue("");
  });

  it("shows a friendly API failure", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ participants: [participant] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ message: "Não foi possível enviar sua mensagem." }),
          { status: 500 },
        ),
      );
    const user = userEvent.setup();

    render(<SendMessageForm />);
    await user.selectOptions(
      await screen.findByLabelText("Para quem você quer enviar?"),
      participant.id,
    );
    await user.type(screen.getByLabelText("Sua mensagem"), "Olá");
    await user.click(
      screen.getByRole("button", { name: "Enviar anonimamente" }),
    );

    expect(
      await screen.findByText("Não foi possível enviar sua mensagem."),
    ).toBeInTheDocument();
  });
});
