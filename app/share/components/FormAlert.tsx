type FormAlertProps = {
  title?: string;
  messages: string[];
  variant?: "error" | "success";
};

const VARIANTS: Record<NonNullable<FormAlertProps["variant"]>, string> = {
  error: "border-rose-200/70 bg-rose-50/80 text-rose-700",
  success: "border-border bg-auth-field text-foreground",
};

export default function FormAlert({
  title,
  messages,
  variant = "error",
}: FormAlertProps) {
  if (!messages.length) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${VARIANTS[variant]}`}
      role="alert"
      aria-live="polite"
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      {/* <ul className="mt-1 list-disc pl-5">
        {messages.map((message, index) => (
          <li key={`${message}-${index}`}>{message}</li>
        ))}
      </ul> */}
    </div>
  );
}
