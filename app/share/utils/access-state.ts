export type AccessStateKind =
  | "ok"
  | "unauthenticated"
  | "payment_required"
  | "forbidden"
  | "not_found"
  | "error";

export type AccessState = {
  kind: AccessStateKind;
  status?: number;
  message?: string;
};

export const OK_ACCESS_STATE: AccessState = { kind: "ok" };

export const getAccessStateFromStatus = (
  status?: number,
  message?: string,
): AccessState => {
  switch (status) {
    case 401:
      return { kind: "unauthenticated", status, message };
    case 402:
      return { kind: "payment_required", status, message };
    case 403:
      return { kind: "forbidden", status, message };
    case 404:
      return { kind: "not_found", status, message };
    default:
      return { kind: "error", status, message };
  }
};
