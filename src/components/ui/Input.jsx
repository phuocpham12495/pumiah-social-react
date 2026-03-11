import React, { useState } from 'react'
import './Input.css'

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error,
  icon,
  disabled = false,
  required = false,
  id,
  name,
  className = '',
  ...props
}) {
  const [focused, setFocused] = useState(false)

  return (
    <div className={`input-group ${error ? 'input-group--error' : ''} ${focused ? 'input-group--focused' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="input-group__label">
          {label}
          {required && <span className="input-group__required">*</span>}
        </label>
      )}
      <div className="input-group__wrapper">
        {icon && <span className="input-group__icon">{icon}</span>}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="input-group__input"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </div>
      {error && <span className="input-group__error">{error}</span>}
    </div>
  )
}
