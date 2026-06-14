import { render, screen } from "@testing-library/react";
import { MessagesList } from "@/components/MessagesList";

describe("MessagesList", () => {
  it("shows an empty state", () => {
    render(<MessagesList messages={[]} />);

    expect(
      screen.getByText("Ainda não há mensagens para você."),
    ).toBeInTheDocument();
  });

  it("shows only anonymous message text", () => {
    render(
      <MessagesList
        messages={[{ id: "m1", messageText: "Deus te abençoe" }]}
      />,
    );

    expect(screen.getByText("Deus te abençoe")).toBeInTheDocument();
    expect(screen.queryByText(/remetente/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/data|hora/i)).not.toBeInTheDocument();
  });
});
