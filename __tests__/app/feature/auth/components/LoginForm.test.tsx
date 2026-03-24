import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LoginForm from "@/app/feature/auth/components/LoginForm";
import { login } from "@/app/feature/auth/api/authApi";

const mockReplace = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string }>) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    refresh: mockRefresh,
  }),
}));

jest.mock("@/app/feature/auth/api/authApi", () => ({
  login: jest.fn(),
}));

const mockedLogin = jest.mocked(login);

const renderLoginForm = () => {
  const queryClient = new QueryClient();
  const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

  render(
    <QueryClientProvider client={queryClient}>
      <LoginForm />
    </QueryClientProvider>,
  );

  return { invalidateQueriesSpy };
};

describe("LoginForm", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockRefresh.mockReset();
    mockedLogin.mockReset();
  });

  it("shows client validation errors", async () => {
    renderLoginForm();

    fireEvent.blur(screen.getByPlaceholderText("you@example.com"));
    fireEvent.blur(screen.getByPlaceholderText("********"));

    expect(await screen.findByText("email must be an email")).toBeInTheDocument();
    expect(
      await screen.findByText("password should not be empty"),
    ).toBeInTheDocument();
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it("submits valid credentials and redirects on success", async () => {
    mockedLogin.mockResolvedValue({
      ok: true,
      data: {
        message: "ok",
        user: {
          id: "1",
          name: "Hung",
          email: "hung@example.com",
        },
      },
    });

    const { invalidateQueriesSpy } = renderLoginForm();

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "hung@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("********"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith({
        email: "hung@example.com",
        password: "secret",
      });
    });

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("/");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows the mapped server title when the request fails", async () => {
    mockedLogin.mockResolvedValue({
      ok: false,
      error: {
        status: 401,
        messages: ["Unauthorized"],
      },
    });

    const { invalidateQueriesSpy } = renderLoginForm();

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "hung@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("********"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("Incorrect email or password"),
    ).toBeInTheDocument();
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
