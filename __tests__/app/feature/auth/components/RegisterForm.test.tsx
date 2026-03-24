import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RegisterForm from "@/app/feature/auth/components/RegisterForm";
import { register as registerUser } from "@/app/feature/auth/api/authApi";

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
  register: jest.fn(),
}));

const mockedRegister = jest.mocked(registerUser);

const renderRegisterForm = () => {
  const queryClient = new QueryClient();
  const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

  render(
    <QueryClientProvider client={queryClient}>
      <RegisterForm />
    </QueryClientProvider>,
  );

  return { invalidateQueriesSpy };
};

describe("RegisterForm", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockRefresh.mockReset();
    mockedRegister.mockReset();
  });

  it("shows validation errors for invalid input", async () => {
    renderRegisterForm();

    fireEvent.change(screen.getByPlaceholderText("Full name"), {
      target: { value: "" },
    });
    fireEvent.blur(screen.getByPlaceholderText("Full name"));

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "invalid-email" },
    });
    fireEvent.blur(screen.getByPlaceholderText("Email"));

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "123" },
    });
    fireEvent.blur(screen.getByPlaceholderText("Password"));

    expect(await screen.findByText("name should not be empty")).toBeInTheDocument();
    expect(await screen.findByText("email must be an email")).toBeInTheDocument();
    expect(
      await screen.findByText("Password length at least 6 characters"),
    ).toBeInTheDocument();
    expect(mockedRegister).not.toHaveBeenCalled();
  });

  it("submits valid registration data and redirects on success", async () => {
    mockedRegister.mockResolvedValue({
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

    const { invalidateQueriesSpy } = renderRegisterForm();

    fireEvent.change(screen.getByPlaceholderText("Full name"), {
      target: { value: "Hung Nguyen" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "hung@example.com" },
    });
    fireEvent.click(screen.getByRole("radio", { name: /female/i }));
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "secret1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));

    await waitFor(() => {
      expect(mockedRegister).toHaveBeenCalledWith({
        name: "Hung Nguyen",
        email: "hung@example.com",
        gender: "FEMALE",
        password: "secret1",
      });
    });

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("/");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows the mapped server title when registration fails", async () => {
    mockedRegister.mockResolvedValue({
      ok: false,
      error: {
        status: 400,
        messages: ["Bad request"],
      },
    });

    const { invalidateQueriesSpy } = renderRegisterForm();

    fireEvent.change(screen.getByPlaceholderText("Full name"), {
      target: { value: "Hung Nguyen" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "hung@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "secret1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));

    expect(await screen.findByText("Invalid sign-up details")).toBeInTheDocument();
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
