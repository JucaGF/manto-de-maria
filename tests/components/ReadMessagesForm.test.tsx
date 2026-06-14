import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReadMessagesForm } from "@/components/ReadMessagesForm";

const participant = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Henrique",
  slug: "henrique",
};

describe("ReadMessagesForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("validates participant and password", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ participants: [participant] }), {
        status: 200,
      }),
    );
    const user = userEvent.setup();

    render(<ReadMessagesForm />);
    await screen.findByRole("option", { name: "Henrique" });
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(screen.getByText("Escolha seu nome.")).toBeInTheDocument();
    expect(
      screen.getByText("Digite sua senha de dois dígitos."),
    ).toBeInTheDocument();
  });

  it("shows the approved wrong-password message", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ participants: [participant] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Senha incorreta." }), {
          status: 401,
        }),
      );
    const user = userEvent.setup();

    render(<ReadMessagesForm />);
    await user.selectOptions(
      await screen.findByLabelText("Escolha seu nome"),
      participant.slug,
    );
    await user.type(screen.getByLabelText("Digite sua senha"), "27");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Senha incorreta.")).toBeInTheDocument();
  });

  it("renders only the authenticated participant messages", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ participants: [participant] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            participant: { name: "Henrique" },
            messages: [{ id: "m1", messageText: "Deus te abençoe" }],
          }),
          { status: 200 },
        ),
      );
    const user = userEvent.setup();

    render(<ReadMessagesForm />);
    await user.selectOptions(
      await screen.findByLabelText("Escolha seu nome"),
      participant.slug,
    );
    const password = screen.getByLabelText("Digite sua senha");
    expect(password).toHaveAttribute("inputmode", "numeric");
    await user.type(password, "14");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Deus te abençoe")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Minhas mensagens" }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith("/api/read-messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        participantSlug: "henrique",
        password: "14",
      }),
    });
  });
});
