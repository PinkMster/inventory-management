import React, { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

interface BaseFormFieldProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
  className?: string;
}

// Input props type
interface InputFormFieldProps extends BaseFormFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel' | 'url' | 'search';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

// Textarea props type
interface TextareaFormFieldProps extends BaseFormFieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  type: 'textarea';
  rows?: number;
  size?: 'sm' | 'md' | 'lg';
}

// Select props type
interface SelectFormFieldProps extends BaseFormFieldProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  type: 'select';
  options: Array<{ value: string; label: string }>;
  size?: 'sm' | 'md' | 'lg';
}

type FormFieldProps = InputFormFieldProps | TextareaFormFieldProps | SelectFormFieldProps;

const FormField: React.FC<FormFieldProps> = (props) => {
  const { 
    label, 
    error, 
    helperText, 
    required = false,
    fullWidth = true,
    className = '',
    size = 'md',
    ...rest 
  } = props;

  const id = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  const sizeClasses = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-5 text-lg'
  };
  
  const baseClasses = 'bg-white border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300';
  const widthClass = fullWidth ? 'w-full' : '';
  const inputClasses = `${baseClasses} ${errorClasses} ${sizeClasses[size]} ${widthClass} ${className}`;

  const renderInputField = () => {
    switch (props.type) {
      case 'textarea':
        return (
          <textarea
            id={id}
            className={inputClasses}
            rows={props.rows || 4}
            required={required}
            {...rest as TextareaHTMLAttributes<HTMLTextAreaElement>}
          />
        );
        
      case 'select':
        const { options, ...selectRest } = props;
        return (
          <select
            id={id}
            className={inputClasses}
            required={required}
            {...selectRest as SelectHTMLAttributes<HTMLSelectElement>}
          >
            <option value="" disabled>Select an option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      default:
        const { leftIcon, rightIcon } = props as InputFormFieldProps;
        return (
          <div className="relative">
            {leftIcon && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {leftIcon}
              </div>
            )}
            <input
              id={id}
              className={`${inputClasses} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`}
              required={required}
              {...rest as InputHTMLAttributes<HTMLInputElement>}
            />
            {rightIcon && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {rightIcon}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`mb-4 ${widthClass}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {renderInputField()}
      
      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export default FormField; 