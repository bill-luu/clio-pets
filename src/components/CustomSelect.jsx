import React, { useState, useRef, useEffect } from "react";
import "./styles/CustomSelect.css";

export default function CustomSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  required = false,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const dropdownRef = useRef(null);

  // Find selected option label
  useEffect(() => {
    if (value) {
      const selected = options.find((opt) => opt.value === value);
      setSelectedLabel(selected ? selected.label : "");
    } else {
      setSelectedLabel("");
    }
  }, [value, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option) => {
    onChange({
      target: {
        name,
        value: option.value,
      },
    });
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="custom-select-container" ref={dropdownRef}>
      <button
        type="button"
        id={id}
        className={`custom-select-trigger ${isOpen ? "open" : ""} ${
          !value && !selectedLabel ? "placeholder" : ""
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-required={required}
      >
        <span className="custom-select-value">
          {selectedLabel || placeholder}
        </span>
        <svg
          className="custom-select-arrow"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <ul className="custom-select-options" role="listbox">
          {options.map((option) => (
            <li
              key={option.value}
              className={`custom-select-option ${
                value === option.value ? "selected" : ""
              }`}
              onClick={() => handleSelect(option)}
              role="option"
              aria-selected={value === option.value}
            >
              {option.label}
              {value === option.value && (
                <svg
                  className="check-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

