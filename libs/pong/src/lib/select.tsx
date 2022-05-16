export interface SelectProps {
  id: string;
  label: string;
  options: string[];
  onChange: (value: string) => void;
}

export function Select({ id, label, options, onChange }: SelectProps) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <select id={id} onChange={(event) => onChange(event.target.value)}>
        <option value={undefined}>Make a Selection...</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </>
  );
}
