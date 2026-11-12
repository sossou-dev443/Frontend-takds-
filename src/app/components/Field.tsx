type FieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
};

export default function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
}: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
      />
    </div>
  );
}