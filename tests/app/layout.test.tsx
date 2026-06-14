import { render, screen } from "@testing-library/react";
import RootLayout from "@/app/layout";

describe("RootLayout", () => {
  it("declares the Portuguese application shell", () => {
    render(
      <RootLayout>
        <p>conteúdo</p>
      </RootLayout>,
    );

    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });
});
