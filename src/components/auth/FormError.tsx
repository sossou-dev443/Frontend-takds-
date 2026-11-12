type FormErrorProps = {
  message?: string | null;
  tone?: "error" | "success";
};

export default function FormError({ message, tone = "error" }: FormErrorProps) {
  if (!message) return null;

  return (
    <p
      className={`form-message${tone === "success" ? " form-message--success" : ""}`}
      role={tone === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      {message}
    </p>
  );
}
