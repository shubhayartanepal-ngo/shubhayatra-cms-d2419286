export interface SelectProps {
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  value?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  autoComplete?: string;
}

const Select = ({
  options,
  onChange,
  placeholder,
  className = "",
  value,
  disabled,
  id,
  name,
  required,
  autoComplete,
}: SelectProps) => {
  const isControlled = value !== undefined;

  return (
    <div className="relative">
      <select
        className={`h-12 w-full appearance-none rounded-[0.65rem] border border-[#b9c2da] bg-white px-3.5 py-3 pr-10 text-sm text-[#1f2230] outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 ${className}`}
        onChange={(e) => onChange(e.target.value)}
        {...(isControlled ? { value } : { defaultValue: placeholder ? '' : undefined })}
        disabled={disabled}
        id={id}
        name={name}
        required={required}
        autoComplete={autoComplete}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-blue/70" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
};

export default Select;
