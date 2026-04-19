import type { InputHTMLAttributes, ReactNode } from 'react'
import { forwardRef, useState } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  success?: boolean;
  error?: boolean;
  hint?: string;
  label?: ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      className = '',
      success = false,
      error = false,
      hint,
      label,
      wrapperClassName = '',
      labelClassName = '',
      showPasswordToggle = false,
      ...props
    },
    ref,
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const isPasswordField = type === 'password' && showPasswordToggle
    const resolvedType = isPasswordField ? (isPasswordVisible ? 'text' : 'password') : type

    let inputClasses = `h-12 w-full rounded-[0.65rem] border border-[#b9c2da] bg-white px-3.5 py-3 text-sm text-[#1f2230] outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 ${className}`;

    if (isPasswordField) {
      inputClasses += ' pr-11'
    }

    if (props.disabled) {
      inputClasses += ` cursor-not-allowed border-gray-300 text-gray-500 opacity-70`;
    } else if (error) {
      inputClasses += ` border-red-500 text-red-700 focus:border-red-500 focus:ring-red-500/20`;
    } else if (success) {
      inputClasses += ` border-emerald-500 text-emerald-700 focus:border-emerald-500 focus:ring-emerald-500/20`;
    } else {
      inputClasses += ` border-[#b9c2da] bg-white text-[#1f2230]`;
    }

    return (
      <div className={`grid gap-2 ${wrapperClassName}`.trim()}>
        {label && (
          <label className={`text-sm font-semibold text-brand-blue ${labelClassName}`.trim()} htmlFor={props.id}>
            {label}
          </label>
        )}
        <div className="relative">
          <input type={resolvedType} ref={ref} className={inputClasses} {...props} />
          {isPasswordField && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-blue/75 transition hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/25"
              onClick={() => setIsPasswordVisible((current) => !current)}
              aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            >
              {isPasswordVisible ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M10.58 10.58C10.21 10.95 10 11.46 10 12C10 13.1 10.9 14 12 14C12.54 14 13.05 13.79 13.42 13.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M9.88 5.09C10.56 4.88 11.27 4.77 12 4.77C16.5 4.77 20.27 8 21.5 12C20.92 13.89 19.72 15.55 18.13 16.72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M6.11 6.11C4.36 7.38 3.04 9.24 2.5 12C3.73 16 7.5 19.23 12 19.23C13.53 19.23 14.98 18.86 16.25 18.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M2.5 12C3.73 8 7.5 4.77 12 4.77C16.5 4.77 20.27 8 21.5 12C20.27 16 16.5 19.23 12 19.23C7.5 19.23 3.73 16 2.5 12Z" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                </svg>
              )}
            </button>
          )}
        </div>
        {hint && (
          <p
            className={`text-xs ${
              error
                ? 'text-red-500'
                : success
                  ? 'text-emerald-600'
                  : 'text-brand-muted'
            }`}
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
