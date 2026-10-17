import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthForm from "@/components/AuthForm";

async function fillAndSubmit(email, password, buttonName) {
  await userEvent.type(screen.getByLabelText("Email"), email);
  await userEvent.type(screen.getByLabelText("Password"), password);
  await userEvent.click(screen.getByRole("button", { name: buttonName }));
}

test("calls onSubmit with the email and password", async () => {
  const onSubmit = jest.fn().mockResolvedValue();
  render(<AuthForm mode="login" onSubmit={onSubmit} />);
  await fillAndSubmit("me@test.dev", "password123", "Log in");
  expect(onSubmit).toHaveBeenCalledWith("me@test.dev", "password123");
});

test("shows the server's error message when onSubmit fails", async () => {
  const onSubmit = jest.fn().mockRejectedValue(new Error("Invalid email or password."));
  render(<AuthForm mode="login" onSubmit={onSubmit} />);
  await fillAndSubmit("me@test.dev", "wrongpass", "Log in");
  expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password.");
});

test("signup blocks short passwords before calling the server", async () => {
  const onSubmit = jest.fn();
  render(<AuthForm mode="signup" onSubmit={onSubmit} />);
  await fillAndSubmit("me@test.dev", "short", "Sign up");
  expect(onSubmit).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toHaveTextContent(/at least 8 characters/);
});
